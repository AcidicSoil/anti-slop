package reflectcall

import "reflect"

func bad(fn any, args []reflect.Value) {
	reflect.ValueOf(fn).Call(args) // want "dynamic reflection call"
	value := reflect.ValueOf(fn)
	value.CallSlice(args) // want "dynamic reflection call"
	_ = reflect.TypeOf(fn)
	_ = reflect.ValueOf(fn)
}

type Other struct{}

func (Other) Call(_ []reflect.Value)      {}
func (Other) CallSlice(_ []reflect.Value) {}
func good() {
	Other{}.Call(nil)
	Other{}.CallSlice(nil)
}
