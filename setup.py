import os
import sys
from pathlib import Path

def create_directory_structure():
    # Base directory
    base_dir = Path("CognJob")
    
    # Directory structure with files
    structure = {
        # Backend structure
        "backend": {
            "alembic": {
                "versions": {},
                "alembic.ini": ""
            },
            "app": {
                "api": {
                    "__init__.py": "",
                    "deps.py": "",
                    "routes.py": "",
                    "endpoints": {
                        "__init__.py": "",
                        "auth.py": "",
                        "users.py": "",
                        "conversations.py": "",
                        "websockets.py": ""
                    }
                },
                "core": {
                    "__init__.py": "",
                    "config.py": "",
                    "security.py": "",
                    "events.py": ""
                },
                "db": {
                    "__init__.py": "",
                    "session.py": "",
                    "base.py": ""
                },
                "models": {
                    "__init__.py": "",
                    "user.py": "",
                    "conversation.py": ""
                },
                "schemas": {
                    "__init__.py": "",
                    "user.py": "",
                    "conversation.py": ""
                },
                "services": {
                    "__init__.py": "",
                    "audio_processor.py": "",
                    "gpt_processor.py": "",
                    "websocket_manager.py": ""
                },
                "__init__.py": "",
                "main.py": ""
            },
            "tests": {
                "__init__.py": "",
                "conftest.py": "",
                "test_api": {},
                "test_services": {}
            },
            ".env": "# Environment variables\nDATABASE_URL=\nSECRET_KEY=\nOPENAI_API_KEY=",
            "requirements.txt": "fastapi\nuvicorn\nsqlalchemy\npydantic\npasslib\npython-jose\npython-multipart\nalembic\npsycopg2-binary\nwebsockets\nopenai\npython-dotenv",
            "docker-compose.yml": ""
        },
        
        # Frontend structure
        "frontend": {
            "public": {
                "favicon.ico": "",
                "index.html": ""
            },
            "src": {
                "assets": {
                    "images": {}
                },
                "components": {
                    "audio": {
                        "AudioControls.tsx": "",
                        "AudioVisualizer.tsx": "",
                        "RecordingIndicator.tsx": ""
                    },
                    "common": {
                        "Alert.tsx": "",
                        "Button.tsx": "",
                        "Card.tsx": "",
                        "Loading.tsx": ""
                    },
                    "layout": {
                        "Header.tsx": "",
                        "Footer.tsx": "",
                        "Sidebar.tsx": ""
                    },
                    "ui": {
                        "shadcn-components": {}
                    }
                },
                "contexts": {
                    "AuthContext.tsx": "",
                    "WebSocketContext.tsx": ""
                },
                "hooks": {
                    "useAudio.ts": "",
                    "useWebSocket.ts": "",
                    "useAuth.ts": ""
                },
                "pages": {
                    "Auth": {
                        "Login.tsx": "",
                        "Register.tsx": ""
                    },
                    "Dashboard": {
                        "Dashboard.tsx": "",
                        "Settings.tsx": ""
                    },
                    "Pricing": {
                        "PricingPlans.tsx": ""
                    }
                },
                "services": {
                    "api.ts": "",
                    "auth.ts": "",
                    "websocket.ts": ""
                },
                "styles": {
                    "globals.css": ""
                },
                "types": {
                    "index.ts": ""
                },
                "utils": {
                    "audio.ts": "",
                    "formatting.ts": ""
                },
                "App.tsx": "",
                "main.tsx": ""
            },
            ".env": "VITE_API_URL=http://localhost:8000\nVITE_WS_URL=ws://localhost:8000/ws",
            "package.json": "",
            "tsconfig.json": "",
            "tailwind.config.js": "",
            "vite.config.ts": ""
        },
        
        # Deployment structure
        "deploy": {
            "docker": {
                "backend.Dockerfile": "",
                "frontend.Dockerfile": ""
            },
            "kubernetes": {
                "backend": {},
                "frontend": {}
            },
            "terraform": {
                "main.tf": "",
                "variables.tf": "",
                "outputs.tf": ""
            }
        },
        
        # GitHub workflows
        ".github": {
            "workflows": {
                "backend-ci.yml": "",
                "frontend-ci.yml": ""
            }
        },
        
        # Documentation
        "docs": {
            "api": {},
            "architecture": {},
            "deployment": {}
        },
        
        # Scripts
        "scripts": {
            "setup.sh": "",
            "deploy.sh": ""
        },
        
        # Root files
        ".gitignore": """# Python
__pycache__/
*.py[cod]
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg

# Node
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db""",
        "README.md": """# CognJob

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
   source venv/bin/activate  # or `venv\\Scripts\\activate` on Windows
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

This project is licensed under the MIT License - see the LICENSE file for details.""",
        "LICENSE": """MIT License

Copyright (c) 2024 CognJob

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE."""
    }

    def create_structure(current_path, structure):
        for name, content in structure.items():
            path = current_path / name
            
            if isinstance(content, dict):
                # If it's a dictionary, it's a directory
                path.mkdir(parents=True, exist_ok=True)
                create_structure(path, content)
            else:
                # If it's not a dictionary, it's a file
                path.write_text(content)

    try:
        # Create base directory
        base_dir.mkdir(parents=True, exist_ok=True)
        
        # Create the structure
        create_structure(base_dir, structure)
        
        print(f"✅ Project structure created successfully in '{base_dir}'")
        
        # Print next steps
        print("\nNext steps:")
        print("1. cd CognJob")
        print("2. Create a virtual environment: python -m venv venv")
        print("3. Activate the virtual environment:")
        print("   - Windows: .\\venv\\Scripts\\activate")
        print("   - Unix/MacOS: source venv/bin/activate")
        print("4. Install backend dependencies: cd backend && pip install -r requirements.txt")
        print("5. Install frontend dependencies: cd ../frontend && npm install")
        
    except Exception as e:
        print(f"❌ Error creating project structure: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    create_directory_structure()