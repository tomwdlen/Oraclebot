# Oracle ChatKit App

A Next.js chatbot application powered by OpenAI's Agent Builder and ChatKit.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   NEXT_PUBLIC_CHATKIT_WORKFLOW_ID=wf-your-workflow-id-here
   ```

   - **OPENAI_API_KEY**: Get this from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **NEXT_PUBLIC_CHATKIT_WORKFLOW_ID**: Get this from your OpenAI Agent Builder workflow (starts with `wf_`)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features

- ✅ ChatKit React integration
- ✅ Error handling and loading states
- ✅ Responsive design
- ✅ Session management
- ✅ TypeScript support

## Troubleshooting

If you encounter errors:

1. **"OpenAI API key not configured"**: Make sure `OPENAI_API_KEY` is set in your `.env.local` file
2. **"ChatKit workflow ID not configured"**: Make sure `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` is set in your `.env.local` file
3. **"Workflow not found"**: Verify your workflow ID is correct and the workflow exists in your OpenAI account
4. **"Invalid OpenAI API key"**: Check that your API key is valid and has the necessary permissions

## Building for Production

```bash
npm run build
npm start
```

