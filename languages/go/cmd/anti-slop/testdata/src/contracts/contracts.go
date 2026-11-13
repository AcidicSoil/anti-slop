package contracts

import (
	"contracts/events"
	"reflect"
)

func bad(
	input any, // want "parameter type any"
) any { // want "return type any"
	var data map[string]any // want "map\\[string\\]any"
	_ = data
	return input
}

func bareInterface(value interface{}) interface{} { // want "parameter type any" "return type any"
	var data map[string]interface{} // want "map\\[string\\]any"
	_ = data
	return value
}

type NamedMsg interface{}
type LocalAlias = interface{}

func frameworkMessage(value events.Msg) events.Msg         { return value }
func frameworkAlias(value events.MsgAlias) events.MsgAlias { return value }
func localNamed(value NamedMsg) NamedMsg                   { return value }
func localAlias(value LocalAlias) LocalAlias               { return value }

func namedMap(value map[string]events.Msg, alias map[string]LocalAlias) {
	_, _ = value, alias
}

func good(value string) string { return value }
func inspect(value string) {
	_ = reflect.TypeOf(value)
	_ = reflect.ValueOf(value)
}
