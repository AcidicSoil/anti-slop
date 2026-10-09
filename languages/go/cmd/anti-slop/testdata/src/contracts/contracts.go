package contracts

import "reflect"

func bad(
	input any, // want "parameter type any"
) any { // want "return type any"
	var data map[string]any // want "map\\[string\\]any"
	_ = data
	return input
}
func good(value string) string { return value }
func inspect(value string) {
	_ = reflect.TypeOf(value)
	_ = reflect.ValueOf(value)
}
