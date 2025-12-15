/**
 * Nettoie et parse la réponse JSON de ChatGPT
 * Enlève les balises markdown ```json et ``` qui peuvent entourer le JSON
 */
export function parseGPTJson<T = any>(content: string): T {
  let cleanedContent = content.trim();
  
  // Enlever les balises de code markdown au début
  if (cleanedContent.startsWith('```json')) {
    cleanedContent = cleanedContent.replace(/^```json\s*/, '');
  } else if (cleanedContent.startsWith('```')) {
    cleanedContent = cleanedContent.replace(/^```\s*/, '');
  }
  
  // Enlever les balises de code markdown à la fin
  if (cleanedContent.endsWith('```')) {
    cleanedContent = cleanedContent.replace(/\s*```$/, '');
  }
  
  // Nettoyer les espaces au début et à la fin
  cleanedContent = cleanedContent.trim();

  try {
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('❌ Erreur parsing JSON de ChatGPT:', {
      error,
      contentPreview: cleanedContent.substring(0, 200),
      contentLength: cleanedContent.length,
    });
    throw new Error(`Impossible de parser la réponse de ChatGPT: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}
