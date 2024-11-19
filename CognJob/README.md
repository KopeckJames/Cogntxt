# CognJob

A modern SAAS application for real-time audio transcription and analysis.

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker
- PostgreSQL

### Installation

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

### Development

1. Start the backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.