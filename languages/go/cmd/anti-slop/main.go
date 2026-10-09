package main

import (
	"anti-slop-local/analyzers/contracts"
	"anti-slop-local/analyzers/ptrinterface"
	"anti-slop-local/analyzers/reflectcall"
	"anti-slop-local/analyzers/reflectnamedaccess"
	"anti-slop-local/analyzers/widenassert"
	"golang.org/x/tools/go/analysis/multichecker"
)

func main() {
	multichecker.Main(
		contracts.Analyzer,
		ptrinterface.Analyzer,
		reflectcall.Analyzer,
		reflectnamedaccess.Analyzer,
		widenassert.Analyzer,
	)
}
