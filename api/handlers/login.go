package handlers

import (
	"github.com/gin-gonic/gin"

	"why-not-script/api/model"
	"why-not-script/service"
)

func (h *Handler) Login(c *gin.Context) {
	var form model.LoginForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(200, model.Error(""))
		return
	}

	session := service.NewStudentSession(form.LoginType, form.User, form.Pwd, form.Token, h.LogStore, h.QueueStore)
	h.Sessions.Set(session)

	if session.LoginStatus() == "success" {
		c.JSON(200, model.Success(map[string]any{"user": session.LoginUser()}))
		return
	}
	c.JSON(200, model.Error(""))
}

func (h *Handler) LoginCheck(c *gin.Context) {
	session, ok := h.Sessions.Get()
	if !ok {
		c.JSON(200, model.Error(""))
		return
	}
	if session.CheckStatus() {
		c.JSON(200, model.Success(map[string]any{"user": session.LoginUser(), "term": session.XnxqName()}))
		return
	}
	c.JSON(200, model.Error(""))
}

func (h *Handler) Logout(c *gin.Context) {
	_ = h.QueueStore.UserQuit(h.LogStore)
	h.Sessions.Clear()
	c.JSON(200, model.Success(nil))
}
