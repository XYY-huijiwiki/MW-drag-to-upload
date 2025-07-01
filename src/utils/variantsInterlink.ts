function generateVariantGallery(
  filenames: string[],
  selfIndex: number
): string {
  // Entferne das eigene Element und bereite die Dateinamen vor
  const otherFilenames = filenames
    .slice(0, selfIndex)
    .concat(filenames.slice(selfIndex + 1))
    .map((filename) => filename.replaceAll(" ", "_").trim())
    .sort((a, b) => a.localeCompare(b));

  const galleryLines = otherFilenames.join("\n");

  return `== 变体 ==\n<gallery>\n${galleryLines}\n</gallery>\n\n[[分类:有变体的文件]]`;
}

export default generateVariantGallery;
