import React, { useState } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { batchService } from '../services/batchService'
import toast from 'react-hot-toast'

const BatchProcessor = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null)
  const [csvData, setCsvData] = useState([])
  const [validation, setValidation] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const [step, setStep] = useState('upload') // upload, validate, process, results

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0]
    if (!uploadedFile) return

    if (!uploadedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setFile(uploadedFile)
    
    try {
      const data = await batchService.parseCSV(uploadedFile)
      setCsvData(data)
      
      const validationResult = batchService.validateCSVData(data)
      setValidation(validationResult)
      setStep('validate')
    } catch (error) {
      toast.error('Error parsing CSV: ' + error.message)
    }
  }

  const handleProcess = async () => {
    if (!csvData.length) return

    setProcessing(true)
    setStep('process')

    try {
      const results = await batchService.processBatchLinks(csvData)
      setResults(results)
      setStep('results')
      
      if (results.successful.length > 0) {
        toast.success(`Successfully created ${results.successful.length} links`)
      }
      if (results.failed.length > 0) {
        toast.error(`Failed to create ${results.failed.length} links`)
      }
    } catch (error) {
      toast.error('Error processing batch: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const downloadTemplate = () => {
    const template = batchService.generateCSVTemplate()
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'link_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadResults = () => {
    if (!results) return

    const csvContent = [
      'Row,Original URL,Status,Short URL,Error',
      ...results.successful.map(item => 
        `${item.row},"${item.originalUrl}",Success,"${item.shortUrl}",`
      ),
      ...results.failed.map(item => 
        `${item.row},"${item.originalUrl}",Failed,,"${item.error}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'batch_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setFile(null)
    setCsvData([])
    setValidation(null)
    setResults(null)
    setStep('upload')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Batch Link Processor</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Upload CSV File
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Upload a CSV file with your URLs to create multiple links at once
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileText className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload CSV file
                  </span>
                </label>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV Template</span>
                </button>
              </div>
            </div>
          )}

          {step === 'validate' && validation && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Validation Results
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Review the validation results before processing
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {csvData.length}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Rows</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {validation.validRows}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Valid Rows</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {validation.errors.length}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Errors</div>
                </div>
              </div>

              {validation.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <h4 className="font-medium text-red-800 dark:text-red-300">Validation Errors</h4>
                  </div>
                  <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                    {validation.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {validation.errors.length > 10 && (
                      <li>• ... and {validation.errors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={reset}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Upload Different File
                </button>
                <button
                  onClick={handleProcess}
                  disabled={!validation.isValid}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Process {validation.validRows} Links
                </button>
              </div>
            </div>
          )}

          {step === 'process' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Processing Links...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we create your links
                </p>
              </div>
            </div>
          )}

          {step === 'results' && results && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Processing Complete
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your batch processing has finished
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {results.total}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Processed</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {results.successful.length}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Successful</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {results.failed.length}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
                </div>
              </div>

              {results.failed.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Failed Links</h4>
                  <div className="space-y-1 text-sm text-red-700 dark:text-red-400">
                    {results.failed.map((item, index) => (
                      <div key={index}>
                        Row {item.row}: {item.originalUrl} - {item.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={downloadResults}
                  className="flex items-center space-x-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Results</span>
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Process Another Batch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BatchProcessor
