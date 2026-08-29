# AI Teacher

## Flask API

Install the backend dependencies and configure an OpenAI API key:

```bash
cd backend
python -m pip install -r requirements.txt
export OPENAI_API_KEY="your-api-key"
python app.py
```

The API listens on `http://127.0.0.1:5000`. Send a question to `POST /ask`:

```bash
curl -X POST http://127.0.0.1:5000/ask \
	-H 'Content-Type: application/json' \
	-d '{"question":"Why is the sky blue?"}'
```

The response is JSON with an `answer` field. Set `OPENAI_MODEL` to override the default `gpt-4o-mini` model.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
