package crawler

import (
	"errors"
	"fmt"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func ExtractCourseList(htmlContent string) ([]map[string]string, error) {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(htmlContent))
	if err != nil {
		return nil, err
	}
	table := doc.Find("table#keywords").First()
	if table.Length() == 0 {
		return nil, errors.New("no table found")
	}

	var headers []string
	thead := table.Find("thead").First()
	if thead.Length() > 0 {
		row := thead.Find("tr").First()
		row.ChildrenFiltered("th,td").Each(func(_ int, cell *goquery.Selection) {
			inner := cell.Find(".tablesorter-header-inner").First()
			text := strings.TrimSpace(inner.Text())
			if text == "" {
				text = strings.TrimSpace(cell.Text())
			}
			headers = append(headers, text)
		})
	}

	tbody := table.Find("tbody").First()
	if len(headers) == 0 {
		firstRow := tbody.Find("tr").First()
		if firstRow.Length() > 0 {
			count := firstRow.ChildrenFiltered("td,th").Length()
			for i := 0; i < count; i++ {
				headers = append(headers, fmt.Sprintf("col_%d", i))
			}
		}
	}

	var rows []map[string]string
	if tbody.Length() == 0 {
		return rows, nil
	}

	tbody.Find("tr").Each(func(_ int, rowSel *goquery.Selection) {
		cells := rowSel.ChildrenFiltered("td,th")
		row := map[string]string{}
		cells.Each(func(i int, cell *goquery.Selection) {
			key := ""
			if i < len(headers) {
				key = headers[i]
			} else {
				key = fmt.Sprintf("extra_%d", i)
			}
			link := cell.Find("a").First()
			value := ""
			if link.Length() > 0 {
				value = strings.TrimSpace(link.Text())
			} else {
				value = strings.TrimSpace(cell.Text())
			}
			row[key] = value
		})

		for _, value := range row {
			if value != "" {
				rows = append(rows, row)
				break
			}
		}
	})

	return rows, nil
}
