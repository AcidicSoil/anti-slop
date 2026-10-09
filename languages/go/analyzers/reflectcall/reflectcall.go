package reflectcall

import (
	"anti-slop-local/analyzers/reflectutil"
	"go/ast"
	"golang.org/x/tools/go/analysis"
)

var Analyzer = &analysis.Analyzer{
	Name: "antislopreflectcall",
	Doc:  "reject dynamic calls through reflect.Value.Call and CallSlice",
	Run:  run,
}

func run(pass *analysis.Pass) (any, error) {
	for _, file := range pass.Files {
		ast.Inspect(file, func(node ast.Node) bool {
			call, ok := node.(*ast.CallExpr)
			if !ok {
				return true
			}
			sel, ok := call.Fun.(*ast.SelectorExpr)
			if !ok || (sel.Sel.Name != "Call" && sel.Sel.Name != "CallSlice") {
				return true
			}
			if reflectutil.IsReceiver(pass.TypesInfo.TypeOf(sel.X), "Value") {
				pass.Reportf(call.Pos(), "dynamic reflection call bypasses typed invocation")
			}
			return true
		})
	}
	return nil, nil
}
