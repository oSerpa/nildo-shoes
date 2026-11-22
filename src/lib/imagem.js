// Reduz a foto no navegador antes de enviar: lado maior até 1600 px, em WEBP.
// Deixa o site mais leve e evita estourar o limite de 5 MB do bucket.
export async function prepararFoto(arquivo, ladoMax = 1600, qualidade = 0.85) {
  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/webp', qualidade))
  return blob ?? arquivo
}
