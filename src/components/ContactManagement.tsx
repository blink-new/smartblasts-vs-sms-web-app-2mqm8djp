import React, { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { 
  ArrowLeft, 
  Plus, 
  Upload, 
  Trash2, 
  Search,
  Users,
  Download,
  AlertCircle
} from 'lucide-react'

interface ContactManagementProps {
  user: any
  onBack: () => void
}

interface Contact {
  id: string
  companyName: string
  contactName: string
  email: string
  website: string
  createdAt: string
  updatedAt: string
}

// CSV Importer Component with advanced duplicate detection
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
  const [websiteOnlyMode, setWebsiteOnlyMode] = useState(false)

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
    if (!websiteOnlyMode && (!columnMapping.email || columnMapping.email === 'none')) {
      alert('Please map the email column or enable website-only mode')
      return
    }
    
    if (websiteOnlyMode && (!columnMapping.website || columnMapping.website === 'none')) {
      alert('Please map the website column for website-only import')
      return
    }

    const rawContacts: Contact[] = previewData.slice(1).map((row, index) => ({
      id: `csv_import_${Date.now()}_${index}`,
      companyName: (columnMapping.companyName !== 'none' ? row[columnMapping.companyName] : '') || '',
      contactName: (columnMapping.contactName !== 'none' ? row[columnMapping.contactName] : '') || '',
      email: (columnMapping.email !== 'none' ? row[columnMapping.email] : '') || '',
      website: (columnMapping.website !== 'none' ? row[columnMapping.website] : '') || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })).filter(contact => {
      if (websiteOnlyMode) {
        return contact.website.trim() !== ''
      } else {
        return contact.email.trim() !== ''
      }
    })

    // Advanced duplicate detection
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
      message += ` (${duplicateCount} duplicates were automatically removed)`
    }
    alert(message)
  }

  if (showPreview && previewData.length > 1) {
    const headers = previewData[0].headers
    const sampleRows = previewData.slice(1, 4)

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">CSV Preview & Column Mapping</h4>
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            Cancel
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={websiteOnlyMode}
              onChange={(e) => setWebsiteOnlyMode(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium text-blue-900">
              Website-only import (no email required)
            </span>
          </label>
          <p className="text-xs text-blue-800 mt-1">
            Enable this if you only want to import website URLs without email addresses
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label>Company Name Column</Label>
            <select 
              className="w-full p-2 border rounded"
              value={columnMapping.companyName} 
              onChange={(e) => setColumnMapping(prev => ({ ...prev, companyName: e.target.value }))}
            >
              <option value="none">None</option>
              {headers.map((header: string) => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Contact Name Column</Label>
            <select 
              className="w-full p-2 border rounded"
              value={columnMapping.contactName} 
              onChange={(e) => setColumnMapping(prev => ({ ...prev, contactName: e.target.value }))}
            >
              <option value="none">None</option>
              {headers.map((header: string) => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Email Column {!websiteOnlyMode && '*'}</Label>
            <select 
              className="w-full p-2 border rounded"
              value={columnMapping.email} 
              onChange={(e) => setColumnMapping(prev => ({ ...prev, email: e.target.value }))}
            >
              <option value="none">None</option>
              {headers.map((header: string) => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Website Column {websiteOnlyMode && '*'}</Label>
            <select 
              className="w-full p-2 border rounded"
              value={columnMapping.website} 
              onChange={(e) => setColumnMapping(prev => ({ ...prev, website: e.target.value }))}
            >
              <option value="none">None</option>
              {headers.map((header: string) => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
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
          <Button 
            onClick={importContacts} 
            disabled={
              websiteOnlyMode 
                ? (!columnMapping.website || columnMapping.website === 'none')
                : (!columnMapping.email || columnMapping.email === 'none')
            }
          >
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
          <li>• Required: Email column (or Website column if using website-only mode)</li>
          <li>• Optional: Company Name, Contact Name, Website columns</li>
          <li>• Duplicates will be automatically detected and removed</li>
          <li>• Example: company_name,contact_name,email,website</li>
          <li>• Website-only example: company_name,website</li>
        </ul>
      </div>
    </div>
  )
}

const ContactManagement: React.FC<ContactManagementProps> = ({ user, onBack }) => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [newContact, setNewContact] = useState({
    companyName: '',
    contactName: '',
    email: '',
    website: ''
  })

  const loadContacts = async () => {
    try {
      setLoading(true)
      const contactData = await blink.db.contacts.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      const formattedContacts = contactData.map((contact: any) => ({
        id: contact.id,
        companyName: contact.companyName || contact.company_name || '',
        contactName: contact.contactName || contact.contact_name || '',
        email: contact.email || '',
        website: contact.website || '',
        createdAt: contact.createdAt || contact.created_at,
        updatedAt: contact.updatedAt || contact.updated_at
      }))
      
      setContacts(formattedContacts)
      setFilteredContacts(formattedContacts)
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredContacts(contacts)
    } else {
      const filtered = contacts.filter(contact =>
        contact.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.website.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredContacts(filtered)
    }
  }, [searchTerm, contacts])

  const handleContactChange = (field: string, value: string) => {
    setNewContact(prev => ({ ...prev, [field]: value }))
  }

  const addContact = async () => {
    if (!newContact.companyName || !newContact.email) {
      alert('Please enter company name and email')
      return
    }
    
    // Check for duplicates
    const existingEmails = contacts.map(c => c.email.toLowerCase())
    if (existingEmails.includes(newContact.email.toLowerCase())) {
      alert('This email already exists in your contact list')
      return
    }
    
    try {
      const contactId = `contact_${Date.now()}`
      
      // Create contact in the main contacts table
      await blink.db.contacts.create({
        id: contactId,
        userId: user.id,
        companyName: newContact.companyName,
        contactName: newContact.contactName,
        email: newContact.email,
        website: newContact.website,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      setNewContact({
        companyName: '',
        contactName: '',
        email: '',
        website: ''
      })
      
      loadContacts()
      alert('Contact added successfully!')
    } catch (error) {
      console.error('Error adding contact:', error)
      alert('Error adding contact. Please try again.')
    }
  }

  const removeContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return
    
    try {
      await blink.db.contacts.delete(contactId)
      loadContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Error deleting contact. Please try again.')
    }
  }

  const handleCSVImport = async (importedContacts: Contact[]) => {
    try {
      for (const contact of importedContacts) {
        await blink.db.contacts.create({
          id: `contact_${Date.now()}_${Math.random()}`,
          userId: user.id,
          companyName: contact.companyName,
          contactName: contact.contactName,
          email: contact.email,
          website: contact.website,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      loadContacts()
    } catch (error) {
      console.error('Error importing contacts:', error)
      alert('Error importing contacts. Please try again.')
    }
  }

  const exportContacts = () => {
    if (contacts.length === 0) {
      alert('No contacts to export')
      return
    }

    const csvContent = [
      'company_name,contact_name,email,website',
      ...contacts.map(contact => 
        `"${contact.companyName}","${contact.contactName}","${contact.email}","${contact.website}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
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
              <span className="ml-3 text-gray-500">Contact Management</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={exportContacts} disabled={contacts.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:bg-blue-50 transition-colors border-2 hover:border-blue-200" onClick={() => {
            // Scroll to contacts list
            document.getElementById('contacts-list')?.scrollIntoView({ behavior: 'smooth' })
          }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{contacts.length}</div>
              <p className="text-xs text-blue-600">
                {filteredContacts.length} shown • Click to view all
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(contacts.map(c => c.companyName.toLowerCase())).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique companies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Additions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contacts.filter(c => {
                  const createdDate = new Date(c.createdAt)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return createdDate > weekAgo
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Contact Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Contact</CardTitle>
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

        {/* Bulk Import */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Bulk Import</CardTitle>
          </CardHeader>
          <CardContent>
            <CSVImporter onContactsImported={handleCSVImport} existingContacts={contacts} />
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by company, name, email, or website..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <Card id="contacts-list">
          <CardHeader>
            <CardTitle>All Contacts ({filteredContacts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading contacts...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No contacts found' : 'No contacts yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Add your first contact or import from CSV to get started.'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => document.getElementById('companyName')?.focus()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Contact
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border-b border-gray-300">Company Name</th>
                      <th className="px-4 py-3 text-left font-semibold border-b border-gray-300">Contact Name</th>
                      <th className="px-4 py-3 text-left font-semibold border-b border-gray-300">Email Address</th>
                      <th className="px-4 py-3 text-left font-semibold border-b border-gray-300">Website</th>
                      <th className="px-4 py-3 text-left font-semibold border-b border-gray-300">Added</th>
                      <th className="px-4 py-3 text-center font-semibold border-b border-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredContacts.map((contact, index) => (
                      <tr key={contact.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div className="font-medium text-gray-900">{contact.companyName}</div>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div className="text-gray-700">{contact.contactName || '-'}</div>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <a 
                            href={`mailto:${contact.email}`} 
                            className="text-blue-600 hover:underline"
                          >
                            {contact.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          {contact.website ? (
                            <a 
                              href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {contact.website}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div className="text-gray-600">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContact(contact.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ContactManagement