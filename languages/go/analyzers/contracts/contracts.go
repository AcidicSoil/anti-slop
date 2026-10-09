package contracts

import (
	"go/ast"
	"go/types"

	"golang.org/x/tools/go/analysis"
)

var Analyzer = &analysis.Analyzer{
	Name: "antislopcontracts",
	Doc:  "reject low-evidence Go contracts such as any parameters, any returns, and map[string]any",
	Run:  run,
}

func run(pass *analysis.Pass) (any, error) {
	for _, file := range pass.Files {
		ast.Inspect(file, func(node ast.Node) bool {
			switch current := node.(type) {
			case *ast.FuncType:
				checkFieldList(pass, current.Params, "parameter")
				checkFieldList(pass, current.Results, "return")
			case *ast.MapType:
				if isStringType(pass, current.Key) && isAnyType(pass, current.Value) {
					pass.Reportf(current.Pos(), "map[string]any discards domain evidence; use a named struct or interface contract")
				}
			}
			return true
		})
	}
	return nil, nil
}

func checkFieldList(pass *analysis.Pass, fields *ast.FieldList, kind string) {
	if fields == nil {
		return
	}
	for _, field := range fields.List {
		if isAnyType(pass, field.Type) {
			pass.Reportf(field.Type.Pos(), "%s type any discards contract evidence; use a named interface or concrete boundary type", kind)
		}
	}
}

func isAnyType(pass *analysis.Pass, expr ast.Expr) bool {
	typeInfo := pass.TypesInfo.TypeOf(expr)
	if typeInfo == nil {
		return false
	}
	iface, ok := typeInfo.Underlying().(*types.Interface)
	return ok && iface.NumMethods() == 0
}

func isStringType(pass *analysis.Pass, expr ast.Expr) bool {
	typeInfo := pass.TypesInfo.TypeOf(expr)
	if typeInfo == nil {
		return false
	}
	basic, ok := typeInfo.Underlying().(*types.Basic)
	return ok && basic.Kind() == types.String
}
