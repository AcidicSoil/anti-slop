package widenassert

import (
	"go/ast"
	"go/token"
	"go/types"
	"golang.org/x/tools/go/analysis"
)

var Analyzer = &analysis.Analyzer{
	Name: "antislopwidenassert",
	Doc:  "reject local concrete-to-any-to-concrete type assertions",
	Run:  run,
}

func emptyInterface(t types.Type) bool {
	if t == nil {
		return false
	}
	iface, ok := types.Unalias(t).Underlying().(*types.Interface)
	return ok && iface.NumMethods() == 0
}

func concrete(t types.Type) bool {
	if t == nil {
		return false
	}
	_, interfaceType := types.Unalias(t).Underlying().(*types.Interface)
	_, typeParameter := types.Unalias(t).(*types.TypeParam)
	return !interfaceType && !typeParameter
}

func candidate(pass *analysis.Pass, stmt ast.Stmt) (*types.Var, types.Type) {
	if decl, ok := stmt.(*ast.DeclStmt); ok {
		gen, ok := decl.Decl.(*ast.GenDecl)
		if !ok || gen.Tok != token.VAR || len(gen.Specs) != 1 {
			return nil, nil
		}
		spec, ok := gen.Specs[0].(*ast.ValueSpec)
		if !ok || len(spec.Names) != 1 || len(spec.Values) != 1 || !emptyInterface(pass.TypesInfo.TypeOf(spec.Type)) {
			return nil, nil
		}
		original := pass.TypesInfo.TypeOf(spec.Values[0])
		variable, _ := pass.TypesInfo.Defs[spec.Names[0]].(*types.Var)
		if concrete(original) {
			return variable, original
		}
	}
	assign, ok := stmt.(*ast.AssignStmt)
	if !ok || assign.Tok != token.DEFINE || len(assign.Lhs) != 1 || len(assign.Rhs) != 1 {
		return nil, nil
	}
	ident, ok := assign.Lhs[0].(*ast.Ident)
	if !ok {
		return nil, nil
	}
	conversion, ok := assign.Rhs[0].(*ast.CallExpr)
	if !ok || len(conversion.Args) != 1 || !pass.TypesInfo.Types[conversion.Fun].IsType() ||
		!emptyInterface(pass.TypesInfo.TypeOf(conversion.Fun)) {
		return nil, nil
	}
	original := pass.TypesInfo.TypeOf(conversion.Args[0])
	variable, _ := pass.TypesInfo.Defs[ident].(*types.Var)
	if concrete(original) {
		return variable, original
	}
	return nil, nil
}

func checkBlock(pass *analysis.Pass, block *ast.BlockStmt) {
	for i, statement := range block.List {
		variable, original := candidate(pass, statement)
		if variable == nil {
			continue
		}
	search:
		for _, next := range block.List[i+1:] {
			switch next.(type) {
			case *ast.AssignStmt, *ast.DeclStmt, *ast.ExprStmt, *ast.ReturnStmt:
			default:
				break search
			}
			var uses int
			var assertion *ast.TypeAssertExpr
			ast.Inspect(next, func(node ast.Node) bool {
				switch current := node.(type) {
				case *ast.Ident:
					if pass.TypesInfo.Uses[current] == variable {
						uses++
					}
				case *ast.TypeAssertExpr:
					if id, ok := current.X.(*ast.Ident); ok && pass.TypesInfo.Uses[id] == variable {
						assertion = current
					}
				}
				return true
			})
			if uses == 0 {
				continue
			}
			if uses == 1 && assertion != nil && assertion.Type != nil &&
				types.Identical(pass.TypesInfo.TypeOf(assertion.Type), original) {
				pass.Reportf(assertion.Pos(), "known concrete type widened to any and asserted back; retain the concrete type")
			}
			break
		}
	}
}

func run(pass *analysis.Pass) (any, error) {
	for _, file := range pass.Files {
		ast.Inspect(file, func(node ast.Node) bool {
			if block, ok := node.(*ast.BlockStmt); ok {
				checkBlock(pass, block)
			}
			return true
		})
	}
	return nil, nil
}
