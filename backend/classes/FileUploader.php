<?php
/**
 * File Uploader
 * 文件上传处理类
 */

class FileUploader {
    private $uploadDir;
    private $allowedTypes;
    private $maxFileSize;
    
    public function __construct($uploadDir = null, $allowedTypes = null, $maxFileSize = 5242880) {
        $this->uploadDir = $uploadDir ?? __DIR__ . '/../../frontend/assets/uploads/';
        $this->allowedTypes = $allowedTypes ?? ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        $this->maxFileSize = $maxFileSize; // 默认 5MB
        
        // 确保上传目录存在
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    /**
     * 处理文件上传
     */
    public function upload($fileKey = 'file') {
        if (!isset($_FILES[$fileKey])) {
            throw new Exception('没有上传文件 No file uploaded');
        }
        
        $file = $_FILES[$fileKey];
        
        // 检查上传错误
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('文件上传失败 File upload failed: ' . $this->getUploadErrorMessage($file['error']));
        }
        
        // 检查文件大小
        if ($file['size'] > $this->maxFileSize) {
            throw new Exception('文件太大 File too large (max ' . ($this->maxFileSize / 1024 / 1024) . 'MB)');
        }
        
        // 检查文件类型（在某些环境 fileinfo 扩展可能未启用）
        $mimeType = null;
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
        } elseif (function_exists('mime_content_type')) {
            $mimeType = mime_content_type($file['tmp_name']);
        }
        if (!$mimeType) {
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $map = [
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'pdf' => 'application/pdf',
                'txt' => 'text/plain'
            ];
            if (isset($map[$ext])) {
                $mimeType = $map[$ext];
            } else {
                $mimeType = $_FILES[$fileKey]['type'] ?? 'application/octet-stream';
            }
        }
        if (!in_array($mimeType, $this->allowedTypes)) {
            throw new Exception('不支持的文件类型 Unsupported file type: ' . $mimeType);
        }
        
        // 生成唯一文件名
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('upload_', true) . '.' . $extension;
        $filepath = $this->uploadDir . $filename;
        
        // 移动文件
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            throw new Exception('文件保存失败 Failed to save file');
        }
        
        // 返回相对路径
        return './assets/uploads/' . $filename;
    }
    
    /**
     * 获取上传错误信息
     */
    private function getUploadErrorMessage($errorCode) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension',
        ];
        
        return $errors[$errorCode] ?? 'Unknown error';
    }
    
    /**
     * 删除文件
     */
    public function delete($filepath) {
        $fullPath = __DIR__ . '/../../frontend/' . $filepath;
        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }
        return false;
    }
}
