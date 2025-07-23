import React, { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Upload, 
  Plus, 
  Trash2, 
  Eye,
  MessageCircle,
  Users,
  Settings,
  Clock,
  Mail,
  Link,
  AlertCircle
} from 'lucide-react'

interface CampaignBuilderProps {
  user: any
  campaign?: any
  onBack: () => void
  onSave: () => void
}

interface Contact {
  id: string
  companyName: string
  contactName: string
  email: string
  website: string
}

interface DripMessage {
  id: string
  sequence: number
  delayDays: number
  subjectLine: string
  messageTemplate: string
  isActive: boolean
}

// CSV Importer Component with duplicate detection
interface CSVImporterProps {
  onContactsImported: (contacts: Contact[]) => void
  existingContacts: Contact[]
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onContactsImported, existingContacts }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [columnMapping, setColumnMapping] = useState({
    companyName: 'none',
    contactName: 'none',
    email: 'none',
    website: 'none'
  })

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      return row
    })

    return [{ headers }, ...rows]
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }

    setIsProcessing(true)
    try {
      const text = await file.text()
      const parsed = parseCSV(text)
      
      if (parsed.length > 1) {
        setPreviewData(parsed)
        setShowPreview(true)
        
        // Auto-detect column mappings
        const headers = parsed[0].headers
        const mapping = { companyName: 'none', contactName: 'none', email: 'none', website: 'none' }
        
        headers.forEach((header: string) => {
          const lower = header.toLowerCase()
          if (lower.includes('company') || lower.includes('organization')) {
            mapping.companyName = header
          } else if (lower.includes('name') && !lower.includes('company')) {
            mapping.contactName = header
          } else if (lower.includes('email') || lower.includes('mail')) {
            mapping.email = header
          } else if (lower.includes('website') || lower.includes('url') || lower.includes('domain')) {
            mapping.website = header
          }
        })
        
        setColumnMapping(mapping)
      }
    } catch (error) {
      console.error('Error parsing CSV:', error)
      alert('Error parsing CSV file. Please check the format.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const importContacts = () => {
    if (!columnMapping.email || columnMapping.email === 'none') {
      alert('Please map the email column')
      return
    }

    const rawContacts: Contact[] = previewData.slice(1).map((row, index) => ({
      id: `csv_import_${Date.now()}_${index}`,
      companyName: (columnMapping.companyName !== 'none' ? row[columnMapping.companyName] : '') || '',
      contactName: (columnMapping.contactName !== 'none' ? row[columnMapping.contactName] : '') || '',
      email: row[columnMapping.email] || '',
      website: (columnMapping.website !== 'none' ? row[columnMapping.website] : '') || ''
    })).filter(contact => contact.email.trim() !== '')

    // Remove duplicates based on email
    const existingEmails = new Set(existingContacts.map(c => c.email.toLowerCase()))
    const newContacts = rawContacts.filter(contact => 
      !existingEmails.has(contact.email.toLowerCase())
    )

    const duplicateCount = rawContacts.length - newContacts.length

    onContactsImported(newContacts)
    setShowPreview(false)
    setPreviewData([])
    
    let message = `Successfully imported ${newContacts.length} contacts!`
    if (duplicateCount > 0) {
      message += ` (${duplicateCount} duplicates were removed)`
    }
    alert(message)
  }

  if (showPreview && previewData.length > 1) {
    const headers = previewData[0].headers
    const sampleRows = previewData.slice(1, 4) // Show first 3 rows

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">CSV Preview & Column Mapping</h4>
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            Cancel
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Company Name Column</Label>
            <Select value={columnMapping.companyName} onValueChange={(value) => 
              setColumnMapping(prev => ({ ...prev, companyName: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {headers.map((header: string) => (
                  <SelectItem key={header} value={header}>{header}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Contact Name Column</Label>
            <Select value={columnMapping.contactName} onValueChange={(value) => 
              setColumnMapping(prev => ({ ...prev, contactName: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {headers.map((header: string) => (
                  <SelectItem key={header} value={header}>{header}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Email Column *</Label>
            <Select value={columnMapping.email} onValueChange={(value) => 
              setColumnMapping(prev => ({ ...prev, email: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((header: string) => (
                  <SelectItem key={header} value={header}>{header}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Website Column</Label>
            <Select value={columnMapping.website} onValueChange={(value) => 
              setColumnMapping(prev => ({ ...prev, website: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {headers.map((header: string) => (
                  <SelectItem key={header} value={header}>{header}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3 border-b">
            <h5 className="font-medium">Preview (first 3 rows)</h5>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header: string) => (
                    <th key={header} className="px-3 py-2 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row, index) => (
                  <tr key={index} className="border-t">
                    {headers.map((header: string) => (
                      <td key={header} className="px-3 py-2">
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            Cancel
          </Button>
          <Button onClick={importContacts} disabled={!columnMapping.email || columnMapping.email === 'none'}>
            Import {previewData.length - 1} Contacts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        {isProcessing ? (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing CSV file...</p>
          </div>
        ) : (
          <div>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Choose CSV File
            </Button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">CSV Format Requirements</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• First row should contain column headers</li>
          <li>• Required: Email column</li>
          <li>• Optional: Company Name, Contact Name, Website columns</li>
          <li>• Duplicates will be automatically removed</li>
          <li>• Example: company_name,contact_name,email,website</li>
        </ul>
      </div>
    </div>
  )
}

// Rich Text Editor Component for hyperlinks
interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, rows = 6 }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

  const insertLink = () => {
    if (!linkText || !linkUrl) return
    
    const beforeText = value.substring(0, selectionStart)
    const afterText = value.substring(selectionEnd)
    const linkMarkdown = `[${linkText}](${linkUrl})`
    
    const newValue = beforeText + linkMarkdown + afterText
    onChange(newValue)
    
    setShowLinkDialog(false)
    setLinkText('')
    setLinkUrl('')
  }

  const handleTextSelection = () => {
    if (textareaRef) {
      setSelectionStart(textareaRef.selectionStart)
      setSelectionEnd(textareaRef.selectionEnd)
      
      // If text is selected, use it as link text
      if (textareaRef.selectionStart !== textareaRef.selectionEnd) {
        const selectedText = value.substring(textareaRef.selectionStart, textareaRef.selectionEnd)
        setLinkText(selectedText)
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Message Template</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            handleTextSelection()
            setShowLinkDialog(true)
          }}
        >
          <Link className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>
      
      <Textarea
        ref={setTextareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onSelect={handleTextSelection}
      />
      
      <div className="text-xs text-gray-500">
        Use {'{company}'}, {'{contact}'}, {'{website}'} for personalization. 
        Links use markdown format: [Link Text](https://example.com)
      </div>

      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add Hyperlink</h3>
            <div className="space-y-4">
              <div>
                <Label>Link Text</Label>
                <Input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={insertLink} disabled={!linkText || !linkUrl}>
                  Insert Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CampaignBuilder: React.FC<CampaignBuilderProps> = ({ user, campaign, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft',
    sendIntervalSeconds: 10
  })
  const [contacts, setContacts] = useState<Contact[]>([])
  const [dripMessages, setDripMessages] = useState<DripMessage[]>([
    {
      id: 'msg_1',
      sequence: 1,
      delayDays: 0,
      subjectLine: '',
      messageTemplate: '',
      isActive: true
    }
  ])
  const [newContact, setNewContact] = useState({
    companyName: '',
    contactName: '',
    email: '',
    website: ''
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [templates, setTemplates] = useState<any[]>([])
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0)

  const loadCampaignContacts = async (campaignId: string) => {
    try {
      console.log('Loading contacts for campaign:', campaignId)
      const contactData = await blink.db.campaignContacts.list({
        where: { campaignId: campaignId, userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      console.log('Loaded contacts:', contactData.length)
      
      const formattedContacts = contactData.map((contact: any) => ({
        id: contact.id,
        companyName: contact.companyName || contact.company_name || '',
        contactName: contact.contactName || contact.contact_name || '',
        email: contact.email || '',
        website: contact.website || ''
      }))
      
      setContacts(formattedContacts)
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const loadTemplates = async () => {
    try {
      const templateData = await blink.db.templates.list({
        where: { userId: user.id, isActive: "1" },
        orderBy: { createdAt: 'desc' }
      })
      
      console.log('Raw template data from database:', templateData)
      
      const formattedTemplates = templateData.map((template: any) => {
        const formatted = {
          id: template.id,
          name: template.name || 'Untitled Template',
          category: template.category || 'general',
          subjectLine: template.subjectLine || template.subject_line || '',
          messageTemplate: template.messageTemplate || template.message_template || ''
        }
        console.log('Formatted template:', formatted)
        return formatted
      })
      
      setTemplates(formattedTemplates)
      console.log('Templates loaded successfully:', formattedTemplates.length, formattedTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
      setTemplates([]) // Set empty array on error to prevent crashes
    }
  }

  // NEW: Function to reload campaign data directly from database
  const reloadCampaignFromDatabase = async (campaignId: string) => {
    try {
      console.log('🔄 Reloading campaign from database:', campaignId)
      const campaignData = await blink.db.campaigns.list({
        where: { id: campaignId, userId: user.id }
      })
      
      if (campaignData.length > 0) {
        const freshCampaign = campaignData[0]
        console.log('🔄 Fresh campaign data from database:', freshCampaign)
        console.log('🔄 Fresh drip_messages:', freshCampaign.dripMessages || freshCampaign.drip_messages)
        
        const messagesData = freshCampaign.dripMessages || freshCampaign.drip_messages
        if (messagesData) {
          try {
            const parsedMessages = JSON.parse(messagesData)
            if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
              console.log('✅ Reloaded drip messages from database:', parsedMessages)
              setDripMessages(parsedMessages)
              return true
            }
          } catch (error) {
            console.error('❌ Error parsing fresh drip messages:', error)
          }
        }
      }
      return false
    } catch (error) {
      console.error('❌ Error reloading campaign from database:', error)
      return false
    }
  }

  useEffect(() => {
    loadTemplates()
    
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        status: campaign.status || 'draft',
        sendIntervalSeconds: campaign.sendIntervalSeconds || 10
      })
      loadCampaignContacts(campaign.id)
      
      // Load drip messages if they exist - ENHANCED DEBUGGING
      console.log('🔍 Loading campaign data:', campaign)
      console.log('🔍 Campaign drip_messages field:', campaign.drip_messages)
      console.log('🔍 Campaign dripMessages field:', campaign.dripMessages)
      console.log('🔍 All campaign fields:', Object.keys(campaign))
      
      // Try to get drip messages from any possible field name (database uses snake_case)
      const messagesData = campaign.drip_messages || campaign.dripMessages || campaign.drip_messages_backup
      console.log('🔍 Selected messages data:', messagesData)
      console.log('🔍 Messages data type:', typeof messagesData)
      
      if (messagesData) {
        try {
          const parsedMessages = typeof messagesData === 'string' 
            ? JSON.parse(messagesData) 
            : messagesData
          
          console.log('🔍 Parsed messages:', parsedMessages)
          console.log('🔍 Is array:', Array.isArray(parsedMessages))
          console.log('🔍 Array length:', parsedMessages?.length)
          
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            console.log('✅ Setting drip messages:', parsedMessages)
            setDripMessages(parsedMessages)
            console.log('✅ Successfully loaded drip messages:', parsedMessages.length)
            
            // Verify the state was set correctly
            setTimeout(() => {
              console.log('🔍 Drip messages state after setting:', parsedMessages)
            }, 100)
          } else {
            console.log('❌ No valid drip messages array found, keeping default')
          }
        } catch (error) {
          console.error('❌ Error parsing drip messages:', error)
          console.error('❌ Raw data that failed to parse:', messagesData)
        }
      } else {
        console.log('❌ No drip messages data found in campaign')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleContactChange = (field: string, value: string) => {
    setNewContact(prev => ({ ...prev, [field]: value }))
  }

  const addContact = () => {
    if (!newContact.companyName || !newContact.email) return
    
    // Check for duplicates
    const existingEmails = contacts.map(c => c.email.toLowerCase())
    if (existingEmails.includes(newContact.email.toLowerCase())) {
      alert('This email already exists in your contact list')
      return
    }
    
    const contact: Contact = {
      id: `contact_${Date.now()}`,
      ...newContact
    }
    
    setContacts(prev => [...prev, contact])
    setNewContact({
      companyName: '',
      contactName: '',
      email: '',
      website: ''
    })
  }

  const removeContact = (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId))
  }

  const handleCSVImport = (importedContacts: Contact[]) => {
    setContacts(prev => [...prev, ...importedContacts])
  }

  const addDripMessage = () => {
    const newMessage: DripMessage = {
      id: `msg_${Date.now()}`,
      sequence: dripMessages.length + 1,
      delayDays: dripMessages.length === 0 ? 0 : 2,
      subjectLine: '',
      messageTemplate: '',
      isActive: true
    }
    setDripMessages(prev => [...prev, newMessage])
  }

  const updateDripMessage = (messageId: string, field: keyof DripMessage, value: any) => {
    setDripMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, [field]: value } : msg
    ))
  }

  const removeDripMessage = (messageId: string) => {
    if (dripMessages.length <= 1) {
      alert('You must have at least one message in your drip campaign')
      return
    }
    setDripMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  const applyTemplate = (template: any) => {
    try {
      console.log('Applying template:', template)
      console.log('Selected message index:', selectedMessageIndex)
      console.log('Current drip messages:', dripMessages)
      
      if (!template) {
        alert('Error: No template selected')
        return
      }
      
      if (selectedMessageIndex < 0 || selectedMessageIndex >= dripMessages.length) {
        alert('Error: Invalid message selection')
        return
      }

      const updatedMessages = [...dripMessages]
      const currentMessage = updatedMessages[selectedMessageIndex]
      
      console.log('Current message before update:', currentMessage)
      console.log('Template subject line:', template.subjectLine)
      console.log('Template message template:', template.messageTemplate)
      
      updatedMessages[selectedMessageIndex] = {
        ...currentMessage,
        subjectLine: template.subjectLine || '',
        messageTemplate: template.messageTemplate || ''
      }
      
      console.log('Updated message:', updatedMessages[selectedMessageIndex])
      
      setDripMessages(updatedMessages)
      setShowTemplateSelector(false)
      
      // Force a re-render by updating the state
      setTimeout(() => {
        console.log('Template applied successfully, current drip messages:', updatedMessages)
      }, 100)
      
      alert(`Template "${template.name}" applied successfully!`)
    } catch (error) {
      console.error('Error applying template:', error)
      alert(`Error applying template: ${error.message}. Please try again.`)
      setShowTemplateSelector(false)
    }
  }

  const openTemplateSelector = (messageIndex: number) => {
    setSelectedMessageIndex(messageIndex)
    setShowTemplateSelector(true)
  }

  const previewMessage = (message: DripMessage) => {
    if (!message.messageTemplate || contacts.length === 0) return ''
    
    const sampleContact = contacts[0]
    
    return message.messageTemplate
      .replace(/\{company\}/g, sampleContact.companyName)
      .replace(/\{contact\}/g, sampleContact.contactName)
      .replace(/\{website\}/g, sampleContact.website)
  }

  const previewSubject = (message: DripMessage) => {
    if (!message.subjectLine || contacts.length === 0) return ''
    
    const sampleContact = contacts[0]
    
    return message.subjectLine
      .replace(/\{company\}/g, sampleContact.companyName)
      .replace(/\{contact\}/g, sampleContact.contactName)
      .replace(/\{website\}/g, sampleContact.website)
  }

  const saveCampaign = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a campaign name')
      return
    }

    if (dripMessages.some(msg => !msg.subjectLine.trim() || !msg.messageTemplate.trim())) {
      alert('Please complete all drip messages (subject line and message template)')
      return
    }

    setLoading(true)
    try {
      let campaignId = campaign?.id

      // Always save drip messages first to prevent data loss
      const dripMessagesJson = JSON.stringify(dripMessages)
      console.log('Saving drip messages:', dripMessagesJson)

      if (campaign) {
        // Update existing campaign - PRESERVE drip messages
        const updateData = {
          name: formData.name,
          description: formData.description,
          status: formData.status,
          dripMessages: dripMessagesJson, // Always update with current drip messages
          sendIntervalSeconds: formData.sendIntervalSeconds,
          updatedAt: new Date().toISOString(),
          totalContacts: contacts.length
        }
        
        console.log('Updating campaign with data:', updateData)
        await blink.db.campaigns.update(campaign.id, updateData)
        
        console.log('Campaign updated successfully with drip messages')
      } else {
        // Create new campaign
        campaignId = `campaign_${Date.now()}`
        console.log('Creating new campaign with drip messages:', dripMessagesJson)
        await blink.db.campaigns.create({
          id: campaignId,
          userId: user.id,
          name: formData.name,
          description: formData.description,
          status: formData.status,
          dripMessages: dripMessagesJson,
          sendIntervalSeconds: formData.sendIntervalSeconds,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalContacts: contacts.length,
          sentCount: 0,
          responseCount: 0,
          responseRate: 0.0
        })
        console.log('✅ New campaign created successfully with ID:', campaignId)
        
        console.log('Campaign created with drip messages:', dripMessagesJson)
      }

      // Save contacts to both campaign_contacts and global contacts
      if (campaignId && contacts.length > 0) {
        // Delete existing campaign contacts if updating
        if (campaign) {
          try {
            const existingContacts = await blink.db.campaignContacts.list({
              where: { campaignId: campaign.id }
            })
            for (const contact of existingContacts) {
              await blink.db.campaignContacts.delete(contact.id)
            }
          } catch (error) {
            console.error('Error deleting existing contacts:', error)
          }
        }

        // Add new contacts to both tables
        for (const contact of contacts) {
          // Save to campaign_contacts
          await blink.db.campaignContacts.create({
            id: `contact_${campaignId}_${Date.now()}_${Math.random()}`,
            campaignId: campaignId,
            userId: user.id,
            companyName: contact.companyName,
            contactName: contact.contactName,
            email: contact.email,
            website: contact.website,
            status: 'pending',
            createdAt: new Date().toISOString()
          })

          // Save to global contacts (with duplicate handling)
          try {
            await blink.db.contacts.create({
              id: `global_contact_${Date.now()}_${Math.random()}`,
              userId: user.id,
              companyName: contact.companyName,
              contactName: contact.contactName,
              email: contact.email,
              website: contact.website,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })
          } catch (error) {
            // Ignore duplicate errors for global contacts
            console.log('Contact already exists in global database:', contact.email)
          }
        }
      }

      alert('Campaign saved successfully! Drip messages have been preserved.')
      onSave()
    } catch (error) {
      console.error('Error saving campaign:', error)
      alert(`Error saving campaign: ${error.message}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const getDripTimeline = () => {
    let currentDay = 0
    return dripMessages.map(msg => {
      const sendDay = currentDay + msg.delayDays
      currentDay = sendDay
      return { ...msg, sendDay }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-blue-600">SmartBlasts</h1>
              <span className="ml-3 text-gray-500">
                {campaign ? 'Edit Campaign' : 'New Campaign'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={saveCampaign} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Campaign'}
              </Button>
              <Button onClick={saveCampaign} disabled={loading || !formData.name.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Save & Launch
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="drip" className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages ({dripMessages.length})
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Contacts ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="timing" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Timing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Q1 SaaS Outreach Campaign"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of this campaign's goals and strategy"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drip" className="space-y-6">
            {/* Drip Campaign Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Drip Campaign Messages</span>
                  <div className="flex items-center space-x-2">
                    {campaign && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => reloadCampaignFromDatabase(campaign.id)}
                        title="Reload messages from database"
                      >
                        🔄 Reload
                      </Button>
                    )}
                    <Button onClick={addDripMessage} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Message
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getDripTimeline().map((message, index) => (
                    <div key={message.id} className="relative">
                      {/* Timeline connector */}
                      {index < dripMessages.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300"></div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 bg-white border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline">Message {message.sequence}</Badge>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                {message.sendDay === 0 ? 'Send immediately' : `Send after ${message.sendDay} day${message.sendDay > 1 ? 's' : ''}`}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openTemplateSelector(index)}
                                title="Use Template"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Template
                              </Button>
                              {dripMessages.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDripMessage(message.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Delay (days from previous message)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={message.delayDays}
                                onChange={(e) => updateDripMessage(message.id, 'delayDays', parseInt(e.target.value) || 0)}
                                placeholder="0"
                              />
                            </div>
                            
                            <div>
                              <Label>Subject Line</Label>
                              <Input
                                value={message.subjectLine}
                                onChange={(e) => updateDripMessage(message.id, 'subjectLine', e.target.value)}
                                placeholder="e.g., Quick question about {company}'s marketing"
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                Use {'{company}'}, {'{contact}'}, {'{website}'} for personalization
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <RichTextEditor
                              value={message.messageTemplate}
                              onChange={(value) => updateDripMessage(message.id, 'messageTemplate', value)}
                              placeholder="Hi {contact},&#10;&#10;I noticed {company} has been growing rapidly...&#10;&#10;Use {company}, {contact}, and {website} for personalization."
                              rows={6}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Message Preview */}
            {contacts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Message Previews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {dripMessages.map((message, index) => (
                      <div key={message.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Message {message.sequence}</h4>
                          <Badge variant="outline">
                            Day {getDripTimeline()[index].sendDay}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Subject:</Label>
                            <div className="bg-gray-50 p-2 rounded border text-sm">
                              {previewSubject(message) || 'No subject line'}
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Message:</Label>
                            <div className="bg-gray-50 p-3 rounded border whitespace-pre-wrap text-sm">
                              {previewMessage(message) || 'No message template'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-xs text-gray-500">
                      Preview using: {contacts[0].companyName}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={newContact.companyName}
                      onChange={(e) => handleContactChange('companyName', e.target.value)}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input
                      id="contactName"
                      value={newContact.contactName}
                      onChange={(e) => handleContactChange('contactName', e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      placeholder="john@acmecorp.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newContact.website}
                      onChange={(e) => handleContactChange('website', e.target.value)}
                      placeholder="acmecorp.com"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={addContact} 
                  disabled={!newContact.companyName || !newContact.email}
                  className="w-full md:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </CardContent>
            </Card>

            {contacts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Contacts ({contacts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{contact.companyName}</div>
                          <div className="text-sm text-gray-600">
                            {contact.contactName && `${contact.contactName} • `}
                            {contact.email}
                            {contact.website && ` • ${contact.website}`}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContact(contact.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Bulk Import</CardTitle>
              </CardHeader>
              <CardContent>
                <CSVImporter onContactsImported={handleCSVImport} existingContacts={contacts} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Timing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sendInterval">Time Interval Between Messages (seconds)</Label>
                  <Input
                    id="sendInterval"
                    type="number"
                    min="10"
                    max="3600"
                    value={formData.sendIntervalSeconds}
                    onChange={(e) => handleInputChange('sendIntervalSeconds', parseInt(e.target.value) || 10)}
                    placeholder="10"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Minimum 10 seconds, maximum 1 hour (3600 seconds)
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Timing Best Practices</h4>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• 10-30 seconds: Good for small batches (under 100 contacts)</li>
                        <li>• 60-120 seconds: Recommended for larger batches</li>
                        <li>• Longer intervals help avoid spam filters</li>
                        <li>• Consider your email provider's sending limits</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Estimated Send Time</h4>
                  <p className="text-sm text-gray-700">
                    With {contacts.length} contacts and {formData.sendIntervalSeconds} second intervals:
                  </p>
                  <div className="space-y-1 mt-2">
                    <p className="text-sm text-gray-600">
                      • Time between each email: <span className="font-semibold">{formData.sendIntervalSeconds} seconds</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      • Total time to send one message to all contacts: <span className="font-semibold">~{Math.ceil((contacts.length * formData.sendIntervalSeconds) / 60)} minutes</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Selector Dialog */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Select Template</h3>
              <Button variant="outline" onClick={() => setShowTemplateSelector(false)}>
                Cancel
              </Button>
            </div>
            
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Templates Available</h4>
                <p className="text-gray-600 mb-6">
                  You haven't created any templates yet. Create templates in the Templates section to use them here.
                </p>
                <Button variant="outline" onClick={() => setShowTemplateSelector(false)}>
                  Close
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge variant="outline" className="mt-1">{template.category}</Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => applyTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Subject:</Label>
                        <div className="bg-gray-100 p-2 rounded text-sm">
                          {template.subjectLine}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Message Preview:</Label>
                        <div className="bg-gray-100 p-2 rounded text-sm line-clamp-3">
                          {template.messageTemplate.substring(0, 200)}
                          {template.messageTemplate.length > 200 && '...'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignBuilder