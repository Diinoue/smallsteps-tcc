package com.smallsteps.smallsteps.config;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

public class FlexibleLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    private static final DateTimeFormatter BRAZILIAN_DATE = DateTimeFormatter.ofPattern("d/M/yyyy");
    private static final DateTimeFormatter BRAZILIAN_DATE_TIME = DateTimeFormatter.ofPattern("d/M/yyyy HH:mm[:ss]");

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        value = value.trim();

        // 1. Formato dd/MM/yyyy ou d/M/yyyy
        if (value.matches("^\\d{1,2}/\\d{1,2}/\\d{4}$")) {
            return LocalDate.parse(value, BRAZILIAN_DATE).atStartOfDay();
        }

        // 2. Formato dd/MM/yyyy HH:mm:ss
        if (value.matches("^\\d{1,2}/\\d{1,2}/\\d{4} \\d{1,2}:\\d{2}(:\\d{2})?$")) {
            return LocalDateTime.parse(value, BRAZILIAN_DATE_TIME);
        }

        // 3. Formato ISO com Z ou offset (ex: 2026-11-18T20:02:21.122Z)
        if (value.endsWith("Z") || value.matches(".*[+-]\\d{2}:?\\d{2}$")) {
            try {
                return LocalDateTime.ofInstant(Instant.parse(value), ZoneId.systemDefault());
            } catch (Exception ignored) {}
        }

        // 4. Formato ISO padrão LocalDateTime (ex: 2026-11-18T20:02:21)
        try {
            return LocalDateTime.parse(value);
        } catch (Exception e) {
            // 5. Formato yyyy-MM-dd
            try {
                return LocalDate.parse(value).atStartOfDay();
            } catch (Exception ignored) {}
            throw new IOException("Não foi possível converter a data '" + value + "' para LocalDateTime", e);
        }
    }
}
