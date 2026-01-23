package store

import (
	"database/sql"
	"encoding/json"
	"errors"
	"path/filepath"

	_ "modernc.org/sqlite"
)

type QueueItem struct {
	ID     int    `json:"id"`
	User   string `json:"user"`
	Status string `json:"status"`
	// 弃用info字段，计划使用log记录队列信息
	Info    string         `json:"info"`
	Data    map[string]any `json:"data"`
	Created string         `json:"created"`
}

type QueueStore struct {
	db *sql.DB
}

func NewQueueStore() (*QueueStore, error) {
	dbPath := filepath.Join(AppDataDir(), "sqlite.db")
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	store := &QueueStore{db: db}
	if err := store.Init(); err != nil {
		_ = db.Close()
		return nil, err
	}
	return store, nil
}

func (s *QueueStore) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}

func (s *QueueStore) Init() error {
	if s == nil || s.db == nil {
		return errors.New("queue store not initialized")
	}
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS queue_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL,
			info TEXT NOT NULL,
			data TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		)
	`)
	if err != nil {
		return err
	}

	rows, err := s.db.Query("PRAGMA table_info(queue_items)")
	if err != nil {
		return err
	}
	defer rows.Close()

	columns := map[string]bool{}
	for rows.Next() {
		var cid int
		var name, ctype string
		var notnull int
		var dflt sql.NullString
		var pk int
		if scanErr := rows.Scan(&cid, &name, &ctype, &notnull, &dflt, &pk); scanErr != nil {
			return scanErr
		}
		columns[name] = true
	}

	if !columns["user"] {
		_, err = s.db.Exec("ALTER TABLE queue_items ADD COLUMN user TEXT NOT NULL DEFAULT ''")
		if err != nil {
			return err
		}
	}
	if !columns["created_at"] {
		_, err = s.db.Exec("ALTER TABLE queue_items ADD COLUMN created_at TEXT NOT NULL DEFAULT (datetime('now'))")
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *QueueStore) AddQueueItem(user string, data map[string]any, status string, info string) (*QueueItem, error) {
	if err := s.Init(); err != nil {
		return nil, err
	}
	payload, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	res, err := s.db.Exec(
		"INSERT INTO queue_items (user, status, info, data) VALUES (?, ?, ?, ?)",
		user, status, info, string(payload),
	)
	if err != nil {
		return nil, err
	}
	lastID, _ := res.LastInsertId()
	row := s.db.QueryRow(
		"SELECT id, user, status, info, data, created_at FROM queue_items WHERE id = ?",
		lastID,
	)
	item, err := scanQueueItem(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &QueueItem{
				ID:      int(lastID),
				User:    user,
				Status:  status,
				Info:    info,
				Data:    data,
				Created: "",
			}, nil
		}
		return nil, err
	}
	return item, nil
}

func (s *QueueStore) GetQueueItems(status *string) ([]QueueItem, error) {
	if err := s.Init(); err != nil {
		return nil, err
	}

	var rows *sql.Rows
	var err error
	if status == nil {
		rows, err = s.db.Query("SELECT id, user, status, info, data, created_at FROM queue_items ORDER BY id ASC")
	} else {
		rows, err = s.db.Query(
			"SELECT id, user, status, info, data, created_at FROM queue_items WHERE status = ? ORDER BY id ASC",
			*status,
		)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []QueueItem{}
	for rows.Next() {
		item, scanErr := scanQueueItem(rows)
		if scanErr != nil {
			return nil, scanErr
		}
		items = append(items, *item)
	}
	return items, nil
}

func (s *QueueStore) DeleteQueueItem(itemID int) (bool, error) {
	if err := s.Init(); err != nil {
		return false, err
	}
	res, err := s.db.Exec("DELETE FROM queue_items WHERE id = ?", itemID)
	if err != nil {
		return false, err
	}
	rows, _ := res.RowsAffected()
	return rows > 0, nil
}

func (s *QueueStore) UpdateQueueStatus(itemID int, status string) (bool, error) {
	if err := s.Init(); err != nil {
		return false, err
	}
	res, err := s.db.Exec("UPDATE queue_items SET status = ? WHERE id = ?", status, itemID)
	if err != nil {
		return false, err
	}
	rows, _ := res.RowsAffected()
	return rows > 0, nil
}

func (s *QueueStore) SetAllQueueStatus(status string) error {
	if err := s.Init(); err != nil {
		return err
	}
	_, err := s.db.Exec("UPDATE queue_items SET status = ?", status)
	return err
}

func (s *QueueStore) UserQuit(logStore *LogStore) error {
	if err := s.Init(); err != nil {
		return err
	}
	rows, err := s.db.Query("SELECT id FROM queue_items WHERE status = ?", "active")
	if err != nil {
		return err
	}
	defer rows.Close()

	var ids []int
	for rows.Next() {
		var id int
		if scanErr := rows.Scan(&id); scanErr != nil {
			return scanErr
		}
		ids = append(ids, id)
	}
	if logStore != nil {
		for _, id := range ids {
			logStore.WriteLog(id, "帐号退出，任务自动停止。")
		}
	}
	_, err = s.db.Exec(
		"UPDATE queue_items SET status = ?, info = ? WHERE status = 'active'",
		"inactive",
		"已停止运行",
	)
	return err
}

func scanQueueItem(scanner interface{ Scan(dest ...any) error }) (*QueueItem, error) {
	var item QueueItem
	var payload string
	if err := scanner.Scan(&item.ID, &item.User, &item.Status, &item.Info, &payload, &item.Created); err != nil {
		return nil, err
	}
	if payload != "" {
		var data map[string]any
		if err := json.Unmarshal([]byte(payload), &data); err == nil {
			item.Data = data
		}
	}
	if item.Data == nil {
		item.Data = map[string]any{}
	}
	return &item, nil
}
