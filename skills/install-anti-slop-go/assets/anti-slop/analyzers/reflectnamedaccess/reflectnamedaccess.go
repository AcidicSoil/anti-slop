package reflectnamedaccess

import (
	"anti-slop-local/analyzers/reflectutil"
	"go/ast"
	"golang.org/x/tools/go/analysis"
)

var Analyzer = &analysis.Analyzer{
	Name: "antislopreflectnamedaccess",
	Doc:  "reject name-based access through standard library reflect values and types",
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
			if !ok {
				return true
			}
			name := sel.Sel.Name
			valueMethod := name == "FieldByName" || name == "FieldByNameFunc" || name == "MethodByName"
			typeMethod := name == "FieldByName" || name == "MethodByName"
			receiver := pass.TypesInfo.TypeOf(sel.X)
			if (valueMethod && reflectutil.IsReceiver(receiver, "Value")) ||
				(typeMethod && reflectutil.IsReceiver(receiver, "Type")) {
				pass.Reportf(call.Pos(), "dynamic reflection named access bypasses typed field and method contracts")
			}
			return true
		})
	}
	return nil, nil
}
