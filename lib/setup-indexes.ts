import clientPromise from './mongodb';

export async function setupFeedbackIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db('axiom');
    const collection = db.collection('feedbacks');

    await collection.createIndex(
      {
        text: 'text',
        'analysis.summary': 'text'
      },
      {
        name: 'feedback_text_search',
        weights: {
          text: 2,
          'analysis.summary': 1
        }
      }
    );

    console.log('Text indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}