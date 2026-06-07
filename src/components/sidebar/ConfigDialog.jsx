/**
 * ConfigDialog — the credentials + AI provider configuration modal.
 * Extracted from AppSidebar to keep the sidebar focused on navigation.
 *
 * Manages:
 *  - AI provider selection, API key, model, endpoint, region, service tier
 *  - App Store Connect credentials (Key ID, Issuer ID, .p8 file upload,
 *    encrypted key save/load/delete)
 *  - Google Play service account JSON upload / clear
 */

import { useState } from 'react'
import {
  ChevronDown, Key, Trash2, ExternalLink, Lock, Unlock, Save,
  Sparkles, CheckCircle2, AlertCircle, Play,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { PROVIDERS } from '@/services/translationService'
import { encrypt, decrypt } from '@/utils/crypto'

import { ENCRYPTED_KEY_STORAGE } from '@/components/subscription-manager/constants'

export function ConfigDialog({
  open,
  onOpenChange,
  providerConfig,
  onProviderConfigChange,
  ascCredentials,
  onAscCredentialsChange,
  gpCredentials,
  onGpCredentialsChange,
}) {
  const [aiSettingsOpen, setAiSettingsOpen] = useState(true)
  const [ascSettingsOpen, setAscSettingsOpen] = useState(true)
  const [gpSettingsOpen, setGpSettingsOpen] = useState(false)

  const [isDraggingKey, setIsDraggingKey] = useState(false)
  const [isDraggingGpKey, setIsDraggingGpKey] = useState(false)

  const [hasStoredKey, setHasStoredKey] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!window.localStorage.getItem(ENCRYPTED_KEY_STORAGE)
  })
  const [keyPassword, setKeyPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [passwordMode, setPasswordMode] = useState('') // 'save' | 'load'
  const [keyError, setKeyError] = useState('')
  const [isSavingKey, setIsSavingKey] = useState(false)

  const currentApiKey = providerConfig.apiKeys[providerConfig.provider] || ''
  const currentModel =
    providerConfig.models[providerConfig.provider] ||
    PROVIDERS[providerConfig.provider]?.defaultModel ||
    ''

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleProviderChange = (newProvider) => {
    onProviderConfigChange((prev) => ({ ...prev, provider: newProvider }))
  }

  const handleApiKeyChange = (newKey) => {
    onProviderConfigChange((prev) => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [prev.provider]: newKey },
    }))
  }

  const handleModelChange = (newModel) => {
    onProviderConfigChange((prev) => ({
      ...prev,
      models: { ...prev.models, [prev.provider]: newModel },
    }))
  }

  const getModelDisplayName = (model) => {
    if (!model) return 'Select model'
    if (model.includes('inference-profile/')) {
      return model
        .split('/')
        .pop()
        .replace('global.anthropic.', '')
        .replace(/-v\d+:\d+$/, '')
    }
    return model
  }

  // .p8 key file processing
  const processKeyFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.p8')) return
    try {
      const content = await file.text()
      const keyIdMatch = file.name.match(/AuthKey_([A-Z0-9]+)\.p8$/i)
      const extractedKeyId = keyIdMatch ? keyIdMatch[1] : null
      onAscCredentialsChange((prev) => ({
        ...prev,
        privateKey: content,
        ...(extractedKeyId && !prev.keyId ? { keyId: extractedKeyId } : {}),
      }))
    } catch { /* ignore */ }
  }

  const handleKeyUpload = async (event) => {
    await processKeyFile(event.target.files[0])
  }

  const handleKeyDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingKey(true) }
  const handleKeyDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingKey(false) }
  const handleKeyDrop = async (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDraggingKey(false)
    if (e.dataTransfer.files.length > 0) await processKeyFile(e.dataTransfer.files[0])
  }

  // Encrypted key operations
  const handleSaveKeyEncrypted = async () => {
    if (!keyPassword || keyPassword.length < 4) { setKeyError('Password must be at least 4 characters'); return }
    if (!ascCredentials.privateKey) { setKeyError('No key loaded to save'); return }
    setIsSavingKey(true); setKeyError('')
    try {
      const encrypted = await encrypt(ascCredentials.privateKey, keyPassword)
      localStorage.setItem(ENCRYPTED_KEY_STORAGE, encrypted)
      setHasStoredKey(true); setShowPasswordInput(false); setKeyPassword(''); setPasswordMode('')
    } catch { setKeyError('Failed to encrypt key') }
    setIsSavingKey(false)
  }

  const handleLoadKeyEncrypted = async () => {
    if (!keyPassword) { setKeyError('Please enter your password'); return }
    const stored = localStorage.getItem(ENCRYPTED_KEY_STORAGE)
    if (!stored) { setKeyError('No stored key found'); return }
    setIsSavingKey(true); setKeyError('')
    const result = await decrypt(stored, keyPassword)
    if (result.success) {
      onAscCredentialsChange((prev) => ({ ...prev, privateKey: result.data }))
      setShowPasswordInput(false); setKeyPassword(''); setPasswordMode('')
    } else {
      setKeyError('Wrong password')
    }
    setIsSavingKey(false)
  }

  const handleDeleteStoredKey = () => {
    localStorage.removeItem(ENCRYPTED_KEY_STORAGE)
    setHasStoredKey(false)
  }

  const handleCancelPassword = () => {
    setShowPasswordInput(false); setKeyPassword(''); setPasswordMode(''); setKeyError('')
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] sm:max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Configuration</DialogTitle>
          <DialogDescription>
            Manage AI provider, App Store Connect, and Google Play credentials.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90svh-7rem)] px-4 pb-6">
          <div className="space-y-4 pr-2">

            {/* ── AI Provider ─────────────────────────────────────────────── */}
            <Collapsible open={aiSettingsOpen} onOpenChange={setAiSettingsOpen}>
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-2 rounded-xl hover:bg-muted/50 transition-colors [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">AI Provider</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent className="px-2 pt-3 space-y-4">
                    {/* Provider Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(PROVIDERS).map(([key, provider]) => (
                        <button
                          key={key}
                          onClick={() => handleProviderChange(key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                            providerConfig.provider === key
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          {provider.name}
                        </button>
                      ))}
                    </div>

                    {/* API Key */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">API Key</Label>
                      <Input
                        type="password"
                        placeholder={providerConfig.provider === 'openai' ? 'sk-...' : 'Enter your API key...'}
                        value={currentApiKey}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        className="h-9 text-sm bg-muted/30 border-border/50 focus:border-primary/50"
                      />
                    </div>

                    {/* Model */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Model / Deployment Name</Label>
                      {PROVIDERS[providerConfig.provider]?.customModelInput ? (
                        <>
                          <Input
                            placeholder={PROVIDERS[providerConfig.provider]?.defaultModel || 'model-name'}
                            value={currentModel}
                            onChange={(e) => handleModelChange(e.target.value)}
                            className="h-9 text-sm bg-muted/30 border-border/50 focus:border-primary/50"
                            list={`model-suggestions-${providerConfig.provider}`}
                          />
                          <datalist id={`model-suggestions-${providerConfig.provider}`}>
                            {PROVIDERS[providerConfig.provider]?.models.map((model) => (
                              <option key={model} value={model} />
                            ))}
                          </datalist>
                        </>
                      ) : (
                        <select
                          value={currentModel}
                          onChange={(e) => handleModelChange(e.target.value)}
                          className="w-full h-9 rounded-lg bg-muted/30 border border-border/50 px-3 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                        >
                          {PROVIDERS[providerConfig.provider]?.models.map((model) => (
                            <option key={model} value={model}>{getModelDisplayName(model)}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Service Tier (OpenAI) */}
                    {PROVIDERS[providerConfig.provider]?.serviceTiers && (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Service Tier</Label>
                        <select
                          value={providerConfig.serviceTier || 'auto'}
                          onChange={(e) => onProviderConfigChange((prev) => ({ ...prev, serviceTier: e.target.value }))}
                          className="w-full h-9 rounded-lg bg-muted/30 border border-border/50 px-3 text-sm focus:border-primary/50 focus:outline-none transition-colors"
                        >
                          {PROVIDERS[providerConfig.provider].serviceTiers.map((tier) => (
                            <option key={tier} value={tier}>
                              {tier === 'auto' ? 'Auto (default)' : tier === 'priority' ? 'Priority (faster)' : tier === 'flex' ? 'Flex (cheaper)' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-muted-foreground">Priority = faster, Flex = cheaper batch processing</p>
                      </div>
                    )}

                    {/* Endpoint URL (Azure) */}
                    {PROVIDERS[providerConfig.provider]?.needsEndpoint && (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Endpoint URL</Label>
                        <Input
                          placeholder={PROVIDERS[providerConfig.provider]?.placeholder || 'https://your-resource.openai.azure.com'}
                          value={providerConfig.endpoint || ''}
                          onChange={(e) => onProviderConfigChange((prev) => ({ ...prev, endpoint: e.target.value }))}
                          className="h-9 text-sm bg-muted/30 border-border/50 focus:border-primary/50"
                        />
                      </div>
                    )}

                    {/* AWS Region (Bedrock) */}
                    {PROVIDERS[providerConfig.provider]?.needsRegion && (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">AWS Region</Label>
                        <Input
                          placeholder="us-east-1"
                          value={providerConfig.region}
                          onChange={(e) => onProviderConfigChange((prev) => ({ ...prev, region: e.target.value }))}
                          className="h-9 text-sm bg-muted/30 border-border/50 focus:border-primary/50"
                        />
                      </div>
                    )}

                    {/* API Key Status */}
                    <div className="pt-1">
                      {currentApiKey ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs font-medium">Ready to translate</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 text-warning">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">API key required</span>
                        </div>
                      )}
                    </div>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            <SidebarSeparator className="my-4 opacity-50" />

            {/* ── App Store Connect ────────────────────────────────────────── */}
            <Collapsible open={ascSettingsOpen} onOpenChange={setAscSettingsOpen}>
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-2 rounded-xl hover:bg-muted/50 transition-colors [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10">
                        <Key className="h-4 w-4 text-info" />
                      </div>
                      <span className="font-medium">App Store Connect</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent className="px-2 pt-3 space-y-4">
                    <a
                      href="https://appstoreconnect.apple.com/access/integrations/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-info/10 text-info text-xs font-medium hover:bg-info/20 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Get API Key from Apple</span>
                    </a>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Key ID</Label>
                      <Input
                        placeholder="XXXXXXXXXX"
                        value={ascCredentials.keyId}
                        onChange={(e) => onAscCredentialsChange((prev) => ({ ...prev, keyId: e.target.value }))}
                        className="h-9 text-sm bg-muted/30 border-border/50 focus:border-primary/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Issuer ID</Label>
                      <Input
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={ascCredentials.issuerId}
                        onChange={(e) => onAscCredentialsChange((prev) => ({ ...prev, issuerId: e.target.value }))}
                        className="h-9 text-sm bg-muted/30 border-border/50 focus:border-primary/50"
                      />
                    </div>

                    {/* .p8 Key Upload */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Private Key (.p8)</Label>
                      <Input
                        type="file"
                        accept=".p8"
                        onChange={handleKeyUpload}
                        className="hidden"
                        id="sidebar-p8-input"
                      />
                      <label
                        htmlFor="sidebar-p8-input"
                        onDragOver={handleKeyDragOver}
                        onDragLeave={handleKeyDragLeave}
                        onDrop={handleKeyDrop}
                        className={`flex flex-col items-center justify-center h-20 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 text-xs ${
                          isDraggingKey
                            ? 'border-primary bg-primary/10 text-primary scale-[1.02]'
                            : ascCredentials.privateKey
                              ? 'border-success/50 bg-success/10 text-success'
                              : 'border-border/50 hover:border-primary/50 hover:bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        {isDraggingKey ? (
                          <><Key className="h-5 w-5 mb-1 animate-bounce" /><span className="font-medium">Drop your key here</span></>
                        ) : ascCredentials.privateKey ? (
                          <><CheckCircle2 className="h-5 w-5 mb-1" /><span className="font-medium">Private key loaded</span></>
                        ) : (
                          <><Key className="h-5 w-5 mb-1 opacity-50" /><span className="font-medium">Drop .p8 file here</span></>
                        )}
                      </label>

                      {/* Save / Load / Delete encrypted key */}
                      <div className="flex gap-2 pt-2">
                        {ascCredentials.privateKey && !showPasswordInput && (
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5"
                            onClick={() => { setShowPasswordInput(true); setPasswordMode('save'); setKeyError('') }}>
                            <Save className="h-3.5 w-3.5" />
                            Save Encrypted
                          </Button>
                        )}
                        {hasStoredKey && !ascCredentials.privateKey && !showPasswordInput && (
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5"
                            onClick={() => { setShowPasswordInput(true); setPasswordMode('load'); setKeyError('') }}>
                            <Unlock className="h-3.5 w-3.5" />
                            Load Saved Key
                          </Button>
                        )}
                        {hasStoredKey && !showPasswordInput && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Delete saved key">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Saved Key?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the encrypted key from storage. You'll need to upload the .p8 file again.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteStoredKey} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>

                      {/* Password input for save/load */}
                      {showPasswordInput && (
                        <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/50 mt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Lock className="h-3.5 w-3.5" />
                            <span className="font-medium">{passwordMode === 'save' ? 'Encrypt & save key' : 'Enter password to decrypt'}</span>
                          </div>
                          <Input
                            type="password"
                            placeholder="Enter password..."
                            value={keyPassword}
                            onChange={(e) => { setKeyPassword(e.target.value); setKeyError('') }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') passwordMode === 'save' ? handleSaveKeyEncrypted() : handleLoadKeyEncrypted()
                              else if (e.key === 'Escape') handleCancelPassword()
                            }}
                            className="h-9 text-sm"
                            autoFocus
                          />
                          {keyError && <p className="text-xs text-destructive font-medium">{keyError}</p>}
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 h-8 text-xs"
                              onClick={passwordMode === 'save' ? handleSaveKeyEncrypted : handleLoadKeyEncrypted}
                              disabled={isSavingKey}>
                              {isSavingKey ? 'Processing...' : passwordMode === 'save' ? 'Save Key' : 'Unlock'}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleCancelPassword}>Cancel</Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ASC Credentials Status + Clear */}
                    <div className="flex items-center justify-between pt-2">
                      {ascCredentials.keyId && ascCredentials.issuerId && ascCredentials.privateKey ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success flex-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs font-medium">Ready to connect</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground flex-1">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Credentials incomplete</span>
                        </div>
                      )}
                      {(ascCredentials.keyId || ascCredentials.issuerId || ascCredentials.privateKey) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Clear ASC Credentials?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will clear your Key ID, Issuer ID, and loaded private key. You'll need to enter them again to connect.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onAscCredentialsChange({ keyId: '', issuerId: '', privateKey: '' })}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Clear
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            <SidebarSeparator className="my-4 opacity-50" />

            {/* ── Google Play ──────────────────────────────────────────────── */}
            <Collapsible open={gpSettingsOpen} onOpenChange={setGpSettingsOpen}>
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-2 rounded-xl hover:bg-muted/50 transition-colors [&[data-state=open]>svg]:rotate-180">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10">
                        <Play className="h-4 w-4 text-success" />
                      </div>
                      <span className="font-medium">Google Play</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent className="px-2 pt-3 space-y-4">
                    <a
                      href="https://developers.google.com/android-publisher/getting_started"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Setup Guide</span>
                    </a>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Service Account JSON</Label>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const content = await file.text()
                            onGpCredentialsChange((prev) => ({ ...prev, serviceAccountJson: content }))
                          }
                        }}
                        className="hidden"
                        id="sidebar-gp-json-input"
                      />
                      <label
                        htmlFor="sidebar-gp-json-input"
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingGpKey(true) }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingGpKey(false) }}
                        onDrop={async (e) => {
                          e.preventDefault(); e.stopPropagation(); setIsDraggingGpKey(false)
                          const file = e.dataTransfer.files[0]
                          if (file?.name.endsWith('.json')) {
                            const content = await file.text()
                            onGpCredentialsChange((prev) => ({ ...prev, serviceAccountJson: content }))
                          }
                        }}
                        className={`flex flex-col items-center justify-center h-20 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 text-xs ${
                          isDraggingGpKey
                            ? 'border-success bg-success/10 text-success scale-[1.02]'
                            : gpCredentials?.serviceAccountJson
                              ? 'border-success/50 bg-success/10 text-success'
                              : 'border-border/50 hover:border-success/50 hover:bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        {isDraggingGpKey ? (
                          <><Key className="h-5 w-5 mb-1 animate-bounce" /><span className="font-medium">Drop JSON here</span></>
                        ) : gpCredentials?.serviceAccountJson ? (
                          <><CheckCircle2 className="h-5 w-5 mb-1" /><span className="font-medium">Service account loaded</span></>
                        ) : (
                          <><Key className="h-5 w-5 mb-1 opacity-50" /><span className="font-medium">Drop .json file here</span></>
                        )}
                      </label>
                    </div>

                    {/* GP Status + Clear */}
                    <div className="flex items-center justify-between pt-2">
                      {gpCredentials?.serviceAccountJson ? (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success flex-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs font-medium">Ready to connect</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground flex-1">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Upload service account</span>
                        </div>
                      )}
                      {gpCredentials?.serviceAccountJson && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Clear Google Play Credentials?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will clear your service account JSON. You'll need to upload it again to connect.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onGpCredentialsChange({ serviceAccountJson: '' })}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Clear
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
