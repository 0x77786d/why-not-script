package handlers

import (
	"strings"

	"github.com/gin-gonic/gin"

	"why-not-script/api/model"
)

type courseApplyTestForm struct {
	CourseParams map[string]any `json:"courseParams"`
}

func (h *Handler) CourseApplyTest(c *gin.Context) {
	var form courseApplyTestForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(200, model.Error("参数错误"))
		return
	}
	if len(form.CourseParams) == 0 {
		c.JSON(200, model.Error("courseParams 不能为空"))
		return
	}

	session, ok := h.Sessions.Get()
	if !ok {
		c.JSON(200, model.Error("请先登录"))
		return
	}

	body, err := session.ApplyCourseTest(form.CourseParams)
	if err != nil {
		c.JSON(200, model.Error(err.Error()))
		return
	}

	c.JSON(200, model.Success(gin.H{
		"body": strings.TrimSpace(body),
	}))
}
