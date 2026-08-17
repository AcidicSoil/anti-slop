package main

import (
	"anti-slop-local/analyzers/contracts"
	"golang.org/x/tools/go/analysis/multichecker"
)

func main() {
	multichecker.Main(contracts.Analyzer)
}
