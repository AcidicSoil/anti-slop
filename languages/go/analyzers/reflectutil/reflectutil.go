// Package reflectutil identifies standard-library reflect receiver types.
package reflectutil

import "go/types"

func IsReceiver(t types.Type, names ...string) bool {
	if t == nil {
		return false
	}
	named, ok := types.Unalias(t).(*types.Named)
	if !ok || named.Obj().Pkg() == nil || named.Obj().Pkg().Path() != "reflect" {
		return false
	}
	for _, name := range names {
		if named.Obj().Name() == name {
			return true
		}
	}
	return false
}
