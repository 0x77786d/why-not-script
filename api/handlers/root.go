package handlers

import (
	"os"
	"time"

	"github.com/gin-gonic/gin"

	"why-not-script/api/model"
)

func (h *Handler) Root(c *gin.Context) {
	c.JSON(200, model.Success(nil))
}

func (h *Handler) Exit(c *gin.Context) {
	c.JSON(200, model.Success(nil))
	time.AfterFunc(100*time.Millisecond, func() {
		os.Exit(0)
	})
}
