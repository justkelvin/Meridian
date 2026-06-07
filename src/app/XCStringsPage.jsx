/**
 * XCStringsPage — the full XCStrings translation tool UI.
 *
 * All state and handlers live in the useXCStrings hook.
 * This component is purely presentational — it renders the JSX
 * that was previously inline in ProductAppShell in App.jsx.
 *
 * Exported as named export; imported by App.jsx.
 */

import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Languages, Upload, Sparkles, FileText, Download, Search, Edit3,
  Shield, Zap, Terminal, CheckCircle2, AlertCircle, Clock, X, Plus,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { SUPPORTED_LANGUAGES, PROVIDERS } from '@/services/translationService'

export function XCStringsPage({ providerConfig, xcState }) {
  const {
    isTesting, testResult,
    concurrency, setConcurrency,
    batchSize, setBatchSize,
    fileName,
    selectedLanguages,
    isTranslating,
    progress, progressPercent,
    stats,
    logs,
    editDialog, setEditDialog,
    filterLang, setFilterLang,
    searchQuery, setSearchQuery,
    isDragging,
    currentPage, setCurrentPage,
    protectedWords,
    newProtectedWord, setNewProtectedWord,
    currentApiKey,
    availableLanguages,
    filteredTranslations,
    paginatedTranslations,
    totalPages,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleLanguageToggle,
    handleSelectAll,
    handleTestConnection,
    handleTranslate,
    handleSave,
    handleEditTranslation,
    handleSaveEdit,
    addProtectedWord,
    removeProtectedWord,
    truncateText,
  } = xcState

  const currentModel =
    providerConfig.models[providerConfig.provider] ||
    PROVIDERS[providerConfig.provider]?.defaultModel

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl gradient-card border border-border/50 p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-lg">
                <Languages className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Meridian</h1>
                <p className="text-sm text-muted-foreground">AI-powered translation for iOS, macOS &amp; Android</p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-xl">
              Upload your{' '}
              <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-foreground">.xcstrings</code>{' '}
              file, translate to 20+ languages with AI, and export back to Xcode instantly.
            </p>
          </div>
          {stats && (
            <div className="flex gap-4">
              <div className="text-center px-4 py-3 rounded-xl bg-background/50 border border-border/50">
                <div className="text-2xl font-bold text-primary">{stats.totalStrings}</div>
                <div className="text-xs text-muted-foreground">Strings</div>
              </div>
              <div className="text-center px-4 py-3 rounded-xl bg-background/50 border border-border/50">
                <div className="text-2xl font-bold text-success">{stats.languages.length}</div>
                <div className="text-xs text-muted-foreground">Languages</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="translate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="translate" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Translate
          </TabsTrigger>
          <TabsTrigger value="editor" disabled={!xcState.xcstringsData} className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            View &amp; Edit{' '}
            {stats && <Badge variant="secondary" className="ml-1 text-xs">{stats.totalStrings}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* ── Translate Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="translate" className="space-y-6">
          {/* AI Provider Status */}
          <Card className="overflow-hidden border-border/50 shadow-sm card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Provider</CardTitle>
                  <CardDescription>Configure your AI service in the sidebar</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">{PROVIDERS[providerConfig.provider]?.name}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-sm text-muted-foreground">
                    {currentModel?.includes('inference-profile/')
                      ? currentModel.split('/').pop().replace('global.anthropic.', '').replace(/-v\d+:\d+$/, '')
                      : currentModel || 'No model'}
                  </span>
                </div>
                {currentApiKey ? (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-success/10 text-success">
                    <CheckCircle2 className="h-4 w-4" /><span className="text-sm font-medium">Ready</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-warning/10 text-warning">
                    <AlertCircle className="h-4 w-4" /><span className="text-sm font-medium">No API key</span>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={isTesting || !currentApiKey} className="ml-auto">
                  {isTesting ? (
                    <>
                      <span className="animate-spin mr-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </span>
                      Testing...
                    </>
                  ) : 'Test Connection'}
                </Button>
              </div>
              {testResult && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${testResult.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span className="text-sm font-medium">{testResult.message}</span>
                </div>
              )}
              <div className="flex items-center gap-6 pt-2 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">Texts per batch</Label>
                  <Input type="number" min="1" max="30" value={batchSize}
                    onChange={(e) => setBatchSize(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                    className="w-20 h-9 text-center" />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">Parallel requests</Label>
                  <Input type="number" min="1" max="10" value={concurrency}
                    onChange={(e) => setConcurrency(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="w-20 h-9 text-center" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Protected Words */}
          <Card className="border-border/50 shadow-sm card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                  <Shield className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-lg">Protected Words</CardTitle>
                  <CardDescription>Brand names, app names, or terms that should stay untranslated</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Enter a word to protect..." value={newProtectedWord}
                  onChange={(e) => setNewProtectedWord(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addProtectedWord()}
                  className="flex-1 h-10" />
                <Button onClick={addProtectedWord} size="sm" className="h-10 px-4">
                  <Plus className="h-4 w-4 mr-1" />Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-lg bg-muted/30 border border-border/50">
                {protectedWords.map((word) => (
                  <button key={word} onClick={() => removeProtectedWord(word)}
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border/50 text-sm font-medium hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive transition-all">
                    {word}<X className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                  </button>
                ))}
                {protectedWords.length === 0 && (
                  <span className="text-sm text-muted-foreground italic">No protected words added yet</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="border-border/50 shadow-sm card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
                  <Upload className="h-5 w-5 text-info" />
                </div>
                <div>
                  <CardTitle className="text-lg">Upload File</CardTitle>
                  <CardDescription>Load your Xcode localization file to get started</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" accept=".xcstrings" onChange={handleFileUpload} className="hidden" id="file-input" />
              <Label htmlFor="file-input" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                  isDragging ? 'border-primary bg-primary/10 scale-[1.02]'
                    : fileName ? 'border-success/50 bg-success/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}>
                {fileName ? (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 mb-3"><FileText className="h-6 w-6 text-success" /></div>
                    <span className="text-sm font-medium text-success">{fileName}</span>
                    <span className="text-xs text-muted-foreground mt-1">Click to replace</span>
                  </>
                ) : isDragging ? (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3 animate-bounce"><Upload className="h-6 w-6 text-primary" /></div>
                    <span className="text-sm font-medium text-primary">Drop your file here</span>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3"><Upload className="h-6 w-6 text-muted-foreground" /></div>
                    <span className="text-sm font-medium">Click to upload or drag and drop</span>
                    <span className="text-xs text-muted-foreground mt-1">.xcstrings files only</span>
                  </>
                )}
              </Label>
              {stats && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{stats.totalStrings} strings</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{stats.languages.length} languages</span>
                  </div>
                  {selectedLanguages.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-warning/10 text-warning ml-auto">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {selectedLanguages.reduce((acc, lang) => {
                          const missing = stats.totalStrings - (stats.translationCounts[lang] || 0)
                          return acc + missing
                        }, 0)}{' '}translations needed
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Language Selection */}
          <Card className="border-border/50 shadow-sm card-hover">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Languages className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Target Languages</CardTitle>
                    <CardDescription>Select languages to translate your content into</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSelectAll} className="h-9">
                  {selectedLanguages.length === SUPPORTED_LANGUAGES.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const translated = stats?.translationCounts?.[lang.code] || 0
                  const missing = stats ? stats.totalStrings - translated : 0
                  const isComplete = stats && missing === 0
                  const isSelected = selectedLanguages.includes(lang.code)
                  return (
                    <button key={lang.code} onClick={() => handleLanguageToggle(lang.code)}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                        isSelected ? 'border-primary bg-primary/5 shadow-sm'
                          : isComplete ? 'border-success/30 bg-success/5 hover:border-success/50'
                            : 'border-border/50 bg-background hover:border-border hover:bg-muted/30'
                      }`}>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                        isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && (
                          <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm font-medium flex-1">{lang.name}</span>
                      {stats && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          isComplete ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {isComplete ? <CheckCircle2 className="h-3 w-3" /> : missing}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Translate & Export Actions */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Translate &amp; Export</CardTitle>
                  <CardDescription>Run AI translation and download your localized file</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-3">
                <Button onClick={handleTranslate}
                  disabled={isTranslating || !xcState.xcstringsData || !currentApiKey || selectedLanguages.length === 0}
                  className="flex-1 h-12 text-base font-semibold gradient-primary hover:opacity-90 border-0" size="lg">
                  {isTranslating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Translating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Translate{selectedLanguages.length > 0 && ` (${selectedLanguages.length} languages)`}
                    </span>
                  )}
                </Button>
                <Button onClick={handleSave} disabled={!xcState.xcstringsData} variant="outline" className="h-12 px-6" size="lg">
                  <Download className="h-5 w-5 mr-2" />Export
                </Button>
              </div>
              {isTranslating && (
                <div className="space-y-4 p-5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-medium">Translation in progress</span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">{progress.current} / {progress.total}</span>
                  </div>
                  <div className="relative h-3 rounded-full bg-background overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-full gradient-primary transition-all duration-300"
                      style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{progress.currentText}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted-foreground/10">
                  <Terminal className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Activity Log</CardTitle>
                  <CardDescription>Track translation progress and events</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 rounded-xl border border-border/50 bg-muted/20">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Terminal className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No activity yet</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {logs.map((log, index) => (
                      <div key={index} className={`flex items-start gap-3 text-sm py-1.5 px-3 rounded-lg transition-colors ${
                        log.type === 'error' ? 'bg-destructive/10'
                          : log.type === 'success' ? 'bg-success/10'
                            : 'hover:bg-muted/50'
                      }`}>
                        <span className={`mt-0.5 ${log.type === 'error' ? 'text-destructive' : log.type === 'success' ? 'text-success' : 'text-muted-foreground'}`}>
                          {log.type === 'error' ? <AlertCircle className="h-4 w-4" /> : log.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground shrink-0 pt-0.5">{log.timestamp}</span>
                        <span className={`break-all ${log.type === 'error' ? 'text-destructive' : log.type === 'success' ? 'text-success' : 'text-foreground'}`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Editor Tab ───────────────────────────────────────────────────── */}
        <TabsContent value="editor" className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Edit3 className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Translations Editor</CardTitle>
                  <CardDescription>Browse, search, and edit all your translations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Filters */}
              <div className="flex gap-3 flex-wrap items-center p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search strings, keys, or translations..." value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0) }}
                    className="pl-10 h-10 bg-background" />
                </div>
                <select value={filterLang} onChange={(e) => { setFilterLang(e.target.value); setCurrentPage(0) }}
                  className="h-10 rounded-lg border border-input bg-background px-4 text-sm font-medium min-w-[160px]">
                  <option value="all">All Languages</option>
                  {availableLanguages.map((lang) => {
                    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === lang)
                    return (
                      <option key={lang} value={lang}>
                        {langInfo ? `${langInfo.flag} ${langInfo.name}` : lang}
                      </option>
                    )
                  })}
                </select>
                <Button onClick={handleSave} variant="outline" className="h-10">
                  <Download className="h-4 w-4 mr-2" />Export File
                </Button>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="w-[180px] font-semibold">Key</TableHead>
                      <TableHead className="w-[250px] font-semibold">English</TableHead>
                      <TableHead className="font-semibold">Translations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTranslations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-16">
                          <div className="flex flex-col items-center text-muted-foreground">
                            <Search className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm font-medium">
                              {xcState.xcstringsData ? 'No matching strings found' : 'Load a file to see translations'}
                            </p>
                            <p className="text-xs mt-1">
                              {xcState.xcstringsData ? 'Try adjusting your search or filters' : 'Upload a .xcstrings file to get started'}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTranslations.map((item) => (
                        <TableRow key={item.key} className="group hover:bg-muted/20">
                          <TableCell className="font-mono text-xs align-top py-3">
                            <div className="max-w-[150px] truncate text-muted-foreground group-hover:text-foreground transition-colors" title={item.key}>
                              {item.key}
                            </div>
                          </TableCell>
                          <TableCell className="align-top py-3 min-w-[200px] max-w-[300px]">
                            <div className="text-sm whitespace-pre-wrap break-words">{item.english}</div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex flex-wrap gap-2">
                              {(filterLang === 'all' ? availableLanguages : [filterLang]).map((lang) => {
                                const translation = item.translations[lang]?.stringUnit?.value
                                const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === lang)
                                return (
                                  <button key={lang}
                                    onClick={() => handleEditTranslation(item.key, lang, translation)}
                                    title={translation || 'Click to add translation'}
                                    className={`group/btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                      translation
                                        ? 'bg-muted/50 hover:bg-muted border border-transparent hover:border-border'
                                        : 'bg-warning/10 border border-warning/30 hover:bg-warning/20 text-warning'
                                    }`}>
                                    <span className="shrink-0 text-sm">{langInfo?.flag || lang}</span>
                                    <span className="max-w-[100px] truncate">
                                      {translation ? truncateText(translation, 25) : <span className="italic">Add</span>}
                                    </span>
                                    <Edit3 className="h-3 w-3 opacity-0 group-hover/btn:opacity-50 transition-opacity" />
                                  </button>
                                )
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  Showing{' '}
                  <span className="font-medium text-foreground">
                    {filteredTranslations.length > 0 ? currentPage * 50 + 1 : 0}-{Math.min((currentPage + 1) * 50, filteredTranslations.length)}
                  </span>{' '}of{' '}
                  <span className="font-medium text-foreground">{filteredTranslations.length}</span>{' '}strings
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0} className="h-9 w-9 p-0">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) pageNum = i
                        else if (currentPage < 3) pageNum = i
                        else if (currentPage > totalPages - 4) pageNum = totalPages - 5 + i
                        else pageNum = currentPage - 2 + i
                        return (
                          <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                            className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                              currentPage === pageNum ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}>
                            {pageNum + 1}
                          </button>
                        )
                      })}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="h-9 w-9 p-0">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Translation Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ ...editDialog, open: false })}>
        <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{SUPPORTED_LANGUAGES.find((l) => l.code === editDialog.lang)?.flag}</span>
              <div>
                <DialogTitle className="text-xl">Edit Translation</DialogTitle>
                <DialogDescription>
                  {SUPPORTED_LANGUAGES.find((l) => l.code === editDialog.lang)?.name || editDialog.lang}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Key</Label>
                <p className="font-mono text-sm break-all mt-1 text-muted-foreground">{editDialog.key}</p>
              </div>
              <div className="pt-2 border-t border-border/50">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Original (English)</Label>
                <p className="text-sm mt-1">
                  {xcState.xcstringsData?.strings?.[editDialog.key]?.localizations?.en?.stringUnit?.value || editDialog.key}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="translation" className="text-sm font-medium">Translation</Label>
              <Textarea id="translation" value={editDialog.value}
                onChange={(e) => setEditDialog({ ...editDialog, value: e.target.value })}
                rows={5} placeholder="Enter your translation here..." className="resize-none text-base" />
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t border-border/50 bg-muted/20">
            <Button variant="ghost" onClick={() => setEditDialog({ ...editDialog, open: false })}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="gradient-primary border-0">
              <CheckCircle2 className="h-4 w-4 mr-2" />Save Translation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
