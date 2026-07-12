const Document = require('../models/document');

/**
 * Get all documents for a specific vehicle or driver
 */
exports.getDocumentsByEntity = async (req, res) => {
  try {
    const { entity_type, entity_id } = req.query;
    if (!entity_type || !entity_id) {
      return res.status(400).json({ error: 'entity_type and entity_id are required query parameters.' });
    }
    const docs = await Document.getByEntity(entity_type, parseInt(entity_id));
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving documents: ' + err.message });
  }
};

/**
 * Create a new document log entry
 */
exports.createDocument = async (req, res) => {
  try {
    const { entity_type, entity_id, document_type, file_name } = req.body;
    if (!entity_type || !entity_id || !document_type || !file_name) {
      return res.status(400).json({ error: 'entity_type, entity_id, document_type, and file_name are required.' });
    }
    const newDoc = await Document.create(req.body);
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating document: ' + err.message });
  }
};

/**
 * Delete a document log entry
 */
exports.deleteDocument = async (req, res) => {
  try {
    const deleted = await Document.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Document not found.' });
    res.json({ message: 'Document deleted successfully.', document: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting document: ' + err.message });
  }
};
