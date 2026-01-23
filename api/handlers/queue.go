package handlers

import (
	"github.com/gin-gonic/gin"

	"why-not-script/api/model"
)

func (h *Handler) QueueList(c *gin.Context) {
	items, err := h.QueueStore.GetQueueItems(nil)
	if err != nil {
		c.JSON(200, model.Error(err.Error()))
		return
	}
	data := make([]map[string]any, 0, len(items))
	for _, item := range items {
		data = append(data, map[string]any{
			"id":      item.ID,
			"user":    item.User,
			"status":  item.Status,
			"info":    item.Info,
			"data":    item.Data,
			"created": item.Created,
		})
	}
	c.JSON(200, model.Success(data))
}

func (h *Handler) QueueAdd(c *gin.Context) {
	var form model.QueueAddForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(200, model.Error(""))
		return
	}

	user := ""
	if session, ok := h.Sessions.Get(); ok {
		user = session.LoginUser()
	}
	_, err := h.QueueStore.AddQueueItem(user, form.Data, "active", "等待名额释放")
	if err != nil {
		c.JSON(200, model.Error(err.Error()))
		return
	}
	c.JSON(200, model.Success(nil))
}

func (h *Handler) QueueDelete(c *gin.Context) {
	var form model.QueueDeleteForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(200, model.Error(""))
		return
	}

	deleted, err := h.QueueStore.DeleteQueueItem(form.ID)
	if err != nil {
		c.JSON(200, model.Error(err.Error()))
		return
	}
	if deleted {
		if h.LogStore != nil {
			h.LogStore.DeleteLog(form.ID)
		}
		c.JSON(200, model.Success(nil))
		return
	}
	c.JSON(200, model.Error("not_found"))
}

func (h *Handler) QueueStatus(c *gin.Context) {
	var form model.QueueStatusForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(200, model.Error(""))
		return
	}

	if form.Status != "active" && form.Status != "inactive" && form.Status != "error" {
		c.JSON(200, model.Error("invalid_status"))
		return
	}
	updated, err := h.QueueStore.UpdateQueueStatus(form.ID, form.Status)
	if err != nil {
		c.JSON(200, model.Error(err.Error()))
		return
	}
	if !updated {
		c.JSON(200, model.Error("not_found"))
		return
	}
	c.JSON(200, model.Success(nil))
}

func (h *Handler) QueueLog(c *gin.Context) {
	var form model.QueueLogForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(200, model.Error(""))
		return
	}
	logs := []string{}
	if h.LogStore != nil {
		logs = h.LogStore.ReadLogs(form.ID, 100)
	}
	c.JSON(200, model.Success(logs))
}
