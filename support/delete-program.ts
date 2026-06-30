import dotenv from 'dotenv';

dotenv.config();

export type ProgramSummary = {
  id: string;
  name: string;
};

export type DeleteProgramResult = {
  id: string;
  ok: boolean;
  status: number;
  message: string;
};

function requireEnv(name: 'DIDAXIS_URL' | 'DIDAXIS_API_TOKEN'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} not set in .env`);
  }
  return value;
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${requireEnv('DIDAXIS_API_TOKEN')}` };
}

function apiBaseUrl(): string {
  return requireEnv('DIDAXIS_URL').replace(/\/+$/, '');
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 3
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`fetch failed after ${retries} attempts: ${String(lastError)}`);
}

export async function getAllPrograms(): Promise<ProgramSummary[]> {
  const response = await fetchWithRetry(`${apiBaseUrl()}/api/programs`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `GET /api/programs failed: ${response.status} ${response.statusText}`
    );
  }

  const body = await response.json();
  const data = Array.isArray(body?.data) ? body.data : [];

  return data.map((program: { id: string; name?: string }) => ({
    id: program.id,
    name: program.name ?? '(unnamed)',
  }));
}

export async function deleteProgramById(id: string): Promise<DeleteProgramResult> {
  const response = await fetchWithRetry(`${apiBaseUrl()}/api/programs/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  let message = response.statusText;
  try {
    const body = await response.json();
    if (typeof body?.message === 'string') {
      message = body.message;
    }
  } catch {
    // ignore non-JSON responses
  }

  return {
    id,
    ok: response.ok || response.status === 404,
    status: response.status,
    message,
  };
}

export async function deleteProgramsByIds(
  ids: string[]
): Promise<DeleteProgramResult[]> {
  const uniqueIds = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  const results: DeleteProgramResult[] = [];

  for (const id of uniqueIds) {
    results.push(await deleteProgramById(id));
  }

  return results;
}
