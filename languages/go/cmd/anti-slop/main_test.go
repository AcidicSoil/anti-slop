package main

import (
	"testing"

	"anti-slop-local/analyzers/contracts"
	"anti-slop-local/analyzers/ptrinterface"
	"anti-slop-local/analyzers/reflectcall"
	"anti-slop-local/analyzers/reflectnamedaccess"
	"anti-slop-local/analyzers/widenassert"
	"golang.org/x/tools/go/analysis"
	"golang.org/x/tools/go/analysis/analysistest"
)

func TestAnalyzers(t *testing.T) {
	for _, tc := range []struct {
		name     string
		analyzer *analysis.Analyzer
	}{
		{"contracts", contracts.Analyzer},
		{"ptrinterface", ptrinterface.Analyzer},
		{"reflectcall", reflectcall.Analyzer},
		{"reflectnamedaccess", reflectnamedaccess.Analyzer},
		{"widenassert", widenassert.Analyzer},
	} {
		t.Run(tc.name, func(t *testing.T) {
			analysistest.Run(t, analysistest.TestData(), tc.analyzer, tc.name)
		})
	}
}
