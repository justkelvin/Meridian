/**
 * useXCStrings — encapsulates all state and handlers for the XCStrings
 * translation workflow (file upload, language selection, translation, editing,
 * filtering, pagination, export, logs, protected words).
 *
 * Extracted from App.jsx / ProductAppShell to keep the root component lean.
 * Returns everything the XCStringsPage component needs.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  translateStrings,
  testApiConnection,
  SUPPORTED_LANGUAGES,
  PROVIDERS,
  DEFAULT_CONCURRENT_REQUESTS,
  DEFAULT_TEXTS_PER_BATCH,
} from '@/services/translationService'
import {
  parseXCStrings,
  generateXCStrings,
  getTranslationStats,
} from '@/utils/xcstringsParser'
import { PROTECTED_WORDS_KEY, ITEMS_PER_PAGE } from '../constants'

export function useXCStrings(providerConfig) {
  // ── State ──────────────────────────────────────────────────────────────────

  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [concurrency, setConcurrency] = useState(DEFAULT_CONCURRENT_REQUESTS)
  const [batchSize, setBatchSize] = useState(DEFAULT_TEXTS_PER_BATCH)
  const [xcstringsData, setXcstringsData] = useState(null)
  const [fileName, setFileName] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, currentText: '' })
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])

  // Editor / table state
  const [editDialog, setEditDialog] = useState({ open: false, key: '', lang: '', value: '' })
  const [filterLang, setFilterLang] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  // Protected words
  const [protectedWords, setProtectedWords] = useState(() => {
    const saved = localStorage.getItem(PROTECTED_WORDS_KEY)
    return saved ? JSON.parse(saved) : ['MyAppName']
  })
  const [newProtectedWord, setNewProtectedWord] = useState('')

  // ── Derived values ─────────────────────────────────────────────────────────

  const currentApiKey = providerConfig.apiKeys[providerConfig.provider] || ''
  const currentModel =
    providerConfig.models[providerConfig.provider] ||
    PROVIDERS[providerConfig.provider]?.defaultModel

  const progressPercent = progress.total ? (progress.current / progress.total) * 100 : 0

  // ── Persistence ────────────────────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem(PROTECTED_WORDS_KEY, JSON.stringify(protectedWords))
  }, [protectedWords])

  // ── Logging ────────────────────────────────────────────────────────────────

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev.slice(-100), { message, type, timestamp }])
  }, [])

  // ── File Handling ──────────────────────────────────────────────────────────

  const processFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.xcstrings')) {
      addLog('Please upload a .xcstrings file', 'error')
      return
    }
    try {
      const text = await file.text()
      const data = parseXCStrings(text)
      setXcstringsData(data)
      setFileName(file.name)
      const fileStats = getTranslationStats(data)
      setStats(fileStats)
      addLog(`Loaded ${file.name} with ${fileStats.totalStrings} strings`, 'success')
    } catch (error) {
      addLog(`Error loading file: ${error.message}`, 'error')
    }
  }

  const handleFileUpload = async (event) => {
    await processFile(event.target.files[0])
  }

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }
  const handleDrop = async (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    if (e.dataTransfer.files.length > 0) await processFile(e.dataTransfer.files[0])
  }

  // ── Language Selection ─────────────────────────────────────────────────────

  const handleLanguageToggle = (langCode) => {
    setSelectedLanguages((prev) =>
      prev.includes(langCode) ? prev.filter((l) => l !== langCode) : [...prev, langCode]
    )
  }

  const handleSelectAll = () => {
    if (selectedLanguages.length === SUPPORTED_LANGUAGES.length) {
      setSelectedLanguages([])
    } else {
      setSelectedLanguages(SUPPORTED_LANGUAGES.map((l) => l.code))
    }
  }

  // ── API Test ───────────────────────────────────────────────────────────────

  const handleTestConnection = async () => {
    if (!currentApiKey) {
      setTestResult({ success: false, message: 'Please enter an API key first' })
      return
    }
    setIsTesting(true)
    setTestResult(null)
    const config = {
      provider: providerConfig.provider,
      apiKey: currentApiKey,
      model: currentModel,
      region: providerConfig.region,
      endpoint: providerConfig.endpoint || PROVIDERS[providerConfig.provider]?.placeholder || '',
      serviceTier: providerConfig.serviceTier || 'auto',
    }
    const result = await testApiConnection(config)
    setTestResult(result)
    setIsTesting(false)
    if (result.success) {
      addLog(`${PROVIDERS[providerConfig.provider].name} API test successful!`, 'success')
    } else {
      addLog(`${PROVIDERS[providerConfig.provider].name} API test failed: ${result.message}`, 'error')
    }
  }

  // ── Translation ────────────────────────────────────────────────────────────

  const handleTranslate = async () => {
    if (!currentApiKey) {
      addLog(`Please enter your ${PROVIDERS[providerConfig.provider].name} API key`, 'error')
      return
    }
    if (!xcstringsData) { addLog('Please load an .xcstrings file first', 'error'); return }
    if (selectedLanguages.length === 0) { addLog('Please select at least one language', 'error'); return }

    setIsTranslating(true)
    setProgress({ current: 0, total: 0, currentText: 'Starting...' })

    const config = {
      provider: providerConfig.provider,
      apiKey: currentApiKey,
      model: currentModel,
      region: providerConfig.region,
      endpoint: providerConfig.endpoint || PROVIDERS[providerConfig.provider]?.placeholder || '',
      serviceTier: providerConfig.serviceTier || 'auto',
    }

    try {
      const result = await translateStrings(
        xcstringsData,
        selectedLanguages,
        config,
        protectedWords,
        (progressInfo) => {
          setProgress(progressInfo)
          if (progressInfo.log) addLog(progressInfo.log, progressInfo.logType || 'info')
        },
        concurrency,
        batchSize,
      )
      setXcstringsData(result)
      const newStats = getTranslationStats(result)
      setStats(newStats)
      addLog('Translation completed!', 'success')
    } catch (error) {
      addLog(`Translation error: ${error.message}`, 'error')
    } finally {
      setIsTranslating(false)
    }
  }

  // ── Save / Export ──────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!xcstringsData) { addLog('No data to save', 'error'); return }
    try {
      const jsonString = generateXCStrings(xcstringsData)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'Localizable.xcstrings'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      addLog(`Saved ${fileName || 'Localizable.xcstrings'}`, 'success')
    } catch (error) {
      addLog(`Error saving file: ${error.message}`, 'error')
    }
  }

  // ── Editor ─────────────────────────────────────────────────────────────────

  const handleEditTranslation = (key, lang, currentValue) => {
    setEditDialog({ open: true, key, lang, value: currentValue || '' })
  }

  const handleSaveEdit = () => {
    if (!xcstringsData || !editDialog.key) return
    const newData = JSON.parse(JSON.stringify(xcstringsData))
    if (!newData.strings[editDialog.key]) newData.strings[editDialog.key] = {}
    if (!newData.strings[editDialog.key].localizations)
      newData.strings[editDialog.key].localizations = {}
    newData.strings[editDialog.key].localizations[editDialog.lang] = {
      stringUnit: { state: 'translated', value: editDialog.value },
    }
    setXcstringsData(newData)
    const newStats = getTranslationStats(newData)
    setStats(newStats)
    setEditDialog({ open: false, key: '', lang: '', value: '' })
    addLog(`Updated ${editDialog.lang} translation for "${editDialog.key}"`, 'success')
  }

  // ── Protected words ────────────────────────────────────────────────────────

  const addProtectedWord = () => {
    const word = newProtectedWord.trim()
    if (word && !protectedWords.includes(word)) {
      setProtectedWords([...protectedWords, word])
      setNewProtectedWord('')
      addLog(`Added "${word}" to protected words`, 'success')
    }
  }

  const removeProtectedWord = (word) => {
    setProtectedWords(protectedWords.filter((w) => w !== word))
    addLog(`Removed "${word}" from protected words`, 'info')
  }

  // ── Computed / derived for view ────────────────────────────────────────────

  const availableLanguages = useMemo(() => {
    if (!stats) return []
    return stats.languages.filter((l) => l !== 'en')
  }, [stats])

  const filteredTranslations = useMemo(() => {
    if (!xcstringsData?.strings) return []
    return Object.entries(xcstringsData.strings)
      .map(([key, value]) => {
        const localizations = value?.localizations || {}
        const englishText = localizations.en?.stringUnit?.value || key
        return { key, english: englishText, translations: localizations }
      })
      .filter((item) => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const matchesKey = item.key.toLowerCase().includes(query)
          const matchesEnglish = item.english.toLowerCase().includes(query)
          const matchesTranslation = Object.values(item.translations).some(
            (t) => t?.stringUnit?.value?.toLowerCase().includes(query)
          )
          if (!matchesKey && !matchesEnglish && !matchesTranslation) return false
        }
        if (filterLang !== 'all') {
          if (!item.translations[filterLang]?.stringUnit?.value) return false
        }
        return true
      })
      .sort((a, b) => a.key.localeCompare(b.key))
  }, [xcstringsData, searchQuery, filterLang])

  const paginatedTranslations = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE
    return filteredTranslations.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredTranslations, currentPage])

  const totalPages = Math.ceil(filteredTranslations.length / ITEMS_PER_PAGE)

  const getLocalizedStringValue = useCallback(
    (key, lang) => {
      if (!xcstringsData?.strings?.[key]) return ''
      const localization = xcstringsData.strings[key]?.localizations?.[lang]
      if (!localization) return ''
      return (
        localization.stringUnit?.value ||
        localization.variations?.plural?.other?.stringUnit?.value ||
        localization.variations?.device?.other?.stringUnit?.value ||
        ''
      )
    },
    [xcstringsData]
  )

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return {
    // State
    isTesting, testResult,
    concurrency, setConcurrency,
    batchSize, setBatchSize,
    xcstringsData,
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
    // Derived
    currentApiKey,
    availableLanguages,
    filteredTranslations,
    paginatedTranslations,
    totalPages,
    // Handlers
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
    getLocalizedStringValue,
    truncateText,
  }
}
