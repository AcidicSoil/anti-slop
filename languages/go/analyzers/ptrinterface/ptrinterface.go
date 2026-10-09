package ptrinterface

import (
	"go/ast"
	"go/types"
	"golang.org/x/tools/go/analysis"
)

var Analyzer = &analysis.Analyzer{
	Name: "antislopptrinterface",
	Doc:  "reject pointers to interface types",
	Run:  run,
}

func run(pass *analysis.Pass) (any, error) {
	for _, file := range pass.Files {
		ast.Inspect(file, func(node ast.Node) bool {
			star, ok := node.(*ast.StarExpr)
			if !ok || !pass.TypesInfo.Types[star].IsType() {
				return true
			}
			candidate := pass.TypesInfo.TypeOf(star.X)
			if candidate == nil {
				return true
			}
			if _, isParameter := types.Unalias(candidate).(*types.TypeParam); isParameter {
				return true
			}
			if _, ok := types.Unalias(candidate).Underlying().(*types.Interface); ok {
				pass.Reportf(star.Pos(), "pointer to interface hides the intended method contract")
			}
			return true
		})
	}
	return nil, nil
}
