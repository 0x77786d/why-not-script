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
	if session.LoginStatus() == "mfa_required" {
		c.JSON(200, model.ErrorWithCode("mfa_required", 1001, map[string]any{
			"callback_url": session.MFACallbackURL(),
		}))
		return
	}
	c.JSON(200, model.Error(session.LoginStatus()))
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

func (h *Handler) LoginMFACheck(c *gin.Context) {
	session, ok := h.Sessions.Get()
	if !ok {
		c.JSON(200, model.ErrorWithCode("not_found", 1006, nil))
		return
	}

	status := session.PollMFAOnce()
	switch status {
	case "success":
		c.JSON(200, model.Success(map[string]any{"user": session.LoginUser()}))
	case "pending":
		c.JSON(200, model.ErrorWithCode("pending", 1002, nil))
	case "scaned":
		c.JSON(200, model.ErrorWithCode("scaned", 1003, nil))
	case "cancel":
		c.JSON(200, model.ErrorWithCode("cancel", 1004, nil))
	case "expired":
		c.JSON(200, model.ErrorWithCode("expired", 1005, nil))
	default:
		c.JSON(200, model.ErrorWithCode(status, 1006, nil))
	}
}

func (h *Handler) Logout(c *gin.Context) {
	_ = h.QueueStore.UserQuit(h.LogStore)
	h.Sessions.Clear()
	c.JSON(200, model.Success(nil))
}
