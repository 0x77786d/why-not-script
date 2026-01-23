package test

import (
	"fmt"
	"testing"
	"why-not-script/crypto"
)

func TestDes(t *testing.T) {
	key := "36093176907558382349841"
	text := "aassssssssssssssssssssssssssssssssssa"
	fmt.Println(crypto.DesEncrypt(text, key))
}
