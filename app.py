from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from pymongo import MongoClient, errors
from pymongo.server_api import ServerApi
from bson import ObjectId
from datetime import datetime
import bcrypt
import jwt
import os
import config

app = Flask(__name__)
CORS(app)
app.secret_key = config.SECRET_KEY

# MongoDB connection
try:
    client = MongoClient(config.MONGODB_URI, server_api=ServerApi('1'))
    db = client[config.DATABASE_NAME]
    
    # Collections
    people_collection = db[config.PEOPLE_COLLECTION]
    relationships_collection = db[config.RELATIONSHIPS_COLLECTION]
    events_collection = db[config.EVENTS_COLLECTION]
    users_collection = db[config.USERS_COLLECTION]
    
    print("Connected to MongoDB successfully!")
except errors.ConfigurationError as e:
    print(f"Configuration error: {e}")
except Exception as e:
    print(f"An error occurred: {e}")

# Helper function to convert ObjectId to string recursively
def serialize_doc(doc):
    if doc is None:
        return None
    
    if isinstance(doc, dict):
        # Create a new dict to avoid modifying the original
        serialized = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                serialized[key] = str(value)
            elif isinstance(value, list):
                serialized[key] = [serialize_doc(item) for item in value]
            elif isinstance(value, dict):
                serialized[key] = serialize_doc(value)
            else:
                serialized[key] = value
        return serialized
    elif isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    elif isinstance(doc, ObjectId):
        return str(doc)
    else:
        return doc

def serialize_docs(docs):
    return [serialize_doc(doc) for doc in docs]

# Routes for serving the main page
@app.route('/')
def index():
    return render_template('index.html')

# API Routes for People
@app.route('/api/people', methods=['GET'])
def get_people():
    try:
        print("People endpoint called...")
        people = list(people_collection.find())
        print(f"Found {len(people)} people in database")
        
        serialized = serialize_docs(people)
        print(f"Serialized {len(serialized)} people successfully")
        
        return jsonify(serialized)
    except Exception as e:
        print(f"Error in get_people: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/people/<person_id>', methods=['GET'])
def get_person(person_id):
    try:
        person = people_collection.find_one({'_id': ObjectId(person_id)})
        if person:
            return jsonify(serialize_doc(person))
        return jsonify({'error': 'Person not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/people', methods=['POST'])
def add_person():
    try:
        data = request.json
        
        # Create person document
        person = {
            'full_name': data.get('full_name'),
            'native_name': data.get('native_name', ''),
            'gender': data.get('gender'),
            'birth_date': data.get('birth_date'),
            'death_date': data.get('death_date'),
            'place_of_birth': data.get('place_of_birth', ''),
            'education_level': data.get('education_level', ''),
            'occupations': data.get('occupations', []),
            'roles_in_community': data.get('roles_in_community', []),
            'suku': data.get('suku', ''),
            'biography': data.get('biography', ''),
            'photos': data.get('photos', []),
            'notes': data.get('notes', ''),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        result = people_collection.insert_one(person)
        person['_id'] = str(result.inserted_id)
        
        return jsonify(person), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/people/<person_id>', methods=['PUT'])
def update_person(person_id):
    try:
        data = request.json
        data['updated_at'] = datetime.now()
        
        result = people_collection.update_one(
            {'_id': ObjectId(person_id)},
            {'$set': data}
        )
        
        if result.matched_count:
            return jsonify({'message': 'Person updated successfully'})
        return jsonify({'error': 'Person not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/people/<person_id>', methods=['DELETE'])
def delete_person(person_id):
    try:
        result = people_collection.delete_one({'_id': ObjectId(person_id)})
        if result.deleted_count:
            # Also delete related relationships
            relationships_collection.delete_many({
                '$or': [
                    {'person_id_1': person_id},
                    {'person_id_2': person_id}
                ]
            })
            return jsonify({'message': 'Person deleted successfully'})
        return jsonify({'error': 'Person not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes for Relationships
@app.route('/api/relationships', methods=['GET'])
def get_relationships():
    try:
        print("Relationships endpoint called...")
        relationships = list(relationships_collection.find())
        print(f"Found {len(relationships)} relationships in database")
        
        serialized = serialize_docs(relationships)
        print(f"Serialized {len(serialized)} relationships successfully")
        
        return jsonify(serialized)
    except Exception as e:
        print(f"Error in get_relationships: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/relationships', methods=['POST'])
def add_relationship():
    try:
        data = request.json
        
        relationship = {
            'person_id_1': data.get('person_id_1'),
            'person_id_2': data.get('person_id_2'),
            'type': data.get('type'),  # spouse, parent, child, sibling
            'start_date': data.get('start_date'),
            'end_date': data.get('end_date'),
            'status': data.get('status', 'active'),
            'notes': data.get('notes', ''),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        result = relationships_collection.insert_one(relationship)
        relationship['_id'] = str(result.inserted_id)
        
        return jsonify(relationship), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/relationships/<relationship_id>', methods=['DELETE'])
def delete_relationship(relationship_id):
    try:
        result = relationships_collection.delete_one({'_id': ObjectId(relationship_id)})
        if result.deleted_count:
            return jsonify({'message': 'Relationship deleted successfully'})
        return jsonify({'error': 'Relationship not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes for Events
@app.route('/api/events', methods=['GET'])
def get_events():
    try:
        print("Events endpoint called...")
        events = list(events_collection.find())
        print(f"Found {len(events)} events in database")
        
        serialized = serialize_docs(events)
        print(f"Serialized {len(serialized)} events successfully")
        
        return jsonify(serialized)
    except Exception as e:
        print(f"Error in get_events: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/events', methods=['POST'])
def add_event():
    try:
        data = request.json
        
        event = {
            'event_name': data.get('event_name'),
            'type': data.get('type'),
            'date': data.get('date'),
            'location': data.get('location', ''),
            'description': data.get('description', ''),
            'participants': data.get('participants', []),
            'media_url': data.get('media_url', []),
            'notes': data.get('notes', ''),
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        result = events_collection.insert_one(event)
        event['_id'] = str(result.inserted_id)
        
        return jsonify(event), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/events/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    try:
        result = events_collection.delete_one({'_id': ObjectId(event_id)})
        if result.deleted_count:
            return jsonify({'message': 'Event deleted successfully'})
        return jsonify({'error': 'Event not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Route to get family tree data
@app.route('/api/family-tree/<person_id>', methods=['GET'])
def get_family_tree(person_id):
    try:
        # Get the person
        person = people_collection.find_one({'_id': ObjectId(person_id)})
        if not person:
            return jsonify({'error': 'Person not found'}), 404
        
        # Get all relationships for this person
        relationships = list(relationships_collection.find({
            '$or': [
                {'person_id_1': person_id},
                {'person_id_2': person_id}
            ]
        }))
        
        # Get all related people
        related_person_ids = set()
        for rel in relationships:
            related_person_ids.add(rel['person_id_1'])
            related_person_ids.add(rel['person_id_2'])
        
        related_people = list(people_collection.find({
            '_id': {'$in': [ObjectId(pid) for pid in related_person_ids]}
        }))
        
        return jsonify({
            'person': serialize_doc(person),
            'relationships': serialize_docs(relationships),
            'related_people': serialize_docs(related_people)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Route for statistics
@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    try:
        print("Statistics endpoint called...")
        
        total_people = people_collection.count_documents({})
        total_relationships = relationships_collection.count_documents({})
        total_events = events_collection.count_documents({})
        
        print(f"Basic counts - People: {total_people}, Relationships: {total_relationships}, Events: {total_events}")
        
        # Gender distribution
        male_count = people_collection.count_documents({'gender': 'male'})
        female_count = people_collection.count_documents({'gender': 'female'})
        
        print(f"Gender distribution - Male: {male_count}, Female: {female_count}")
        
        # Recent events - simplified without sorting to avoid errors
        try:
            recent_events = list(events_collection.find().limit(5))
            print(f"Recent events found: {len(recent_events)}")
        except Exception as events_error:
            print(f"Error loading events: {events_error}")
            recent_events = []
        
        result = {
            'total_people': total_people,
            'total_relationships': total_relationships,
            'total_events': total_events,
            'gender_distribution': {
                'male': male_count,
                'female': female_count
            },
            'recent_events': serialize_docs(recent_events)
        }
        
        print(f"Returning statistics: {result}")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in get_statistics: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Test endpoints
@app.route('/test')
def test_connection():
    return jsonify({
        'status': 'Server is running!',
        'timestamp': datetime.now().isoformat(),
        'message': 'API endpoint test successful'
    })

@app.route('/test-db')
def test_database():
    try:
        print("Testing database connection...")
        
        # Test database connection
        people_count = people_collection.count_documents({})
        relationships_count = relationships_collection.count_documents({})
        events_count = events_collection.count_documents({})
        
        print(f"Database counts - People: {people_count}, Relationships: {relationships_count}, Events: {events_count}")
        
        # Get sample data to verify actual content
        sample_people = list(people_collection.find().limit(3))
        sample_relationships = list(relationships_collection.find().limit(3))
        sample_events = list(events_collection.find().limit(3))
        
        result = {
            'status': 'Database connection successful!',
            'counts': {
                'people': people_count,
                'relationships': relationships_count,
                'events': events_count
            },
            'samples': {
                'people': serialize_docs(sample_people),
                'relationships': serialize_docs(sample_relationships),
                'events': serialize_docs(sample_events)
            },
            'message': 'Database test successful'
        }
        
        print(f"Database test successful: {result['counts']}")
        return jsonify(result)
        
    except Exception as e:
        print(f"Database test failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'Database connection failed!',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print(f"Starting Akar Budaya application...")
    print(f"Server will be available at: http://localhost:{config.PORT}")
    print("Press Ctrl+C to stop the server")
    app.run(debug=config.DEBUG, host=config.HOST, port=config.PORT)
