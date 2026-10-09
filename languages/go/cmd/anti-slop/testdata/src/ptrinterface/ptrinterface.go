package ptrinterface

import (
	"bytes"
	"io"
)

type Named interface{ Do() }
type Holder struct {
	bad  *Named // want "pointer to interface"
	good *bytes.Buffer
}

func bad(w *io.Writer)    {} // want "pointer to interface"
func good(w io.Writer)    {}
func generic[T any](v *T) {}
