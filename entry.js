(async () => {
  // 获取vite构建的manifest.json文件
  let response = await fetch(
    "https://raw.githubusercontent.com/XYY-huijiwiki/MW-drag-to-upload/dist/.vite/manifest.json"
  );
  let data = await response.json();
  // 根据manifest.json文件获取入口文件的url
  let moduleUrl =
    "https://cdn.jsdelivr.net/gh/XYY-huijiwiki/MW-drag-to-upload@dist/" +
    data["index.html"]["file"];
  // 导入模块
  import(moduleUrl);
})();
