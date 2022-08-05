package com.app.medicalwebapp.utils.extracting;

import com.app.medicalwebapp.model.FileObjectFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FileExtractorStrategyResolver {
    private final List<FileExtractorStrategy> strategies;
    private final SftpExtractorStrategy sftpExtractorStrategy;

    @Autowired
    public FileExtractorStrategyResolver(List<FileExtractorStrategy> strategies, SftpExtractorStrategy sftpExtractorStrategy) {
        this.strategies = strategies;
        this.sftpExtractorStrategy = sftpExtractorStrategy;
    }

    /**
     * Определение способа получения файла, из orthanc или из sftp, зависит от формата файла.
     * Возвращает класс PacsExtractStrategy (для .dcm файлов) или SftpExtractStrategy (для остальных файлов).
     */
    public FileExtractorStrategy getFileExtractor(FileObjectFormat fileFormat) {
        return strategies.stream()
                .filter(strategy -> strategy.supportsFormat(fileFormat))
                .findFirst()
                .orElse(sftpExtractorStrategy);
    }

}
