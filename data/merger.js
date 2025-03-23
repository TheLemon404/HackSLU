const fs = require('fs');
const csv = require('csv-parser');

// TF-IDF Vectorizer class
class TfidfVectorizer {
  constructor() {
    this.vocabulary = new Map();
    this.idf = new Map();
    this.documents = [];
  }

  fit(documents) {
    this.documents = documents;
    const docFreq = new Map();

    // Build vocabulary and document frequency
    documents.forEach((doc, docIndex) => {
      const terms = doc.toLowerCase().split(/\W+/);
      const uniqueTerms = new Set(terms);

      uniqueTerms.forEach(term => {
        if (!this.vocabulary.has(term)) {
          this.vocabulary.set(term, this.vocabulary.size);
        }
        docFreq.set(term, (docFreq.get(term) || 0) + 1);
      });
    });

    // Calculate IDF
    const N = documents.length;
    docFreq.forEach((freq, term) => {
      this.idf.set(term, Math.log(N / freq));
    });
  }

  transform(documents) {
    return documents.map(doc => {
      const vector = new Array(this.vocabulary.size).fill(0);
      const terms = doc.toLowerCase().split(/\W+/);

      terms.forEach(term => {
        if (this.vocabulary.has(term)) {
          const index = this.vocabulary.get(term);
          const tf = terms.filter(t => t === term).length / terms.length;
          const idf = this.idf.get(term);
          vector[index] = tf * idf;
        }
      });

      return vector;
    });
  }

  fitTransform(documents) {
    this.fit(documents);
    return this.transform(documents);
  }
}

// Read CSV file and vectorize
const documents = [];

fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Assuming the text column is named 'text'
    documents.push(row.statement);
  })
  .on('end', () => {
    const vectorizer = new TfidfVectorizer();
    const vectorized = vectorizer.fitTransform(documents);

    console.log('Vectorization complete.');
    console.log('Number of documents:', vectorized.length);
    console.log('Vector dimension:', vectorized[0].length);

    // Optionally, save the vectorized data
    fs.writeFileSync('vectorized_data.json', JSON.stringify(vectorized));
  });