package handlers

import (
	"github.com/gin-gonic/gin"
	"why-not-script/api/model"
)

func (h *Handler) CourseSearch(c *gin.Context) {
	var form model.CourseSearchForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(200, model.Error(""))
		return
	}

	session, ok := h.Sessions.Get()
	if !ok {
		c.JSON(200, model.Error(""))
		return
	}

	list, err := session.SearchCourse(form.Keyword)
	if err != nil {
		c.JSON(200, model.Error(""))
		return
	}
	c.JSON(200, model.Success(list))
}
