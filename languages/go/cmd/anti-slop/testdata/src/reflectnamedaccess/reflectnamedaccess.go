package reflectnamedaccess

import "reflect"

func bad(v any) {
	value := reflect.ValueOf(v)
	value.FieldByName("ID")                                  // want "dynamic reflection named access"
	value.MethodByName("Save")                               // want "dynamic reflection named access"
	value.FieldByNameFunc(func(string) bool { return true }) // want "dynamic reflection named access"
	_, _ = reflect.TypeOf(v).MethodByName("Save")            // want "dynamic reflection named access"
}

type Other struct{}

func (Other) FieldByName(string) {}
func good() {
	Other{}.FieldByName("ID")
	_ = reflect.TypeOf(0)
}
