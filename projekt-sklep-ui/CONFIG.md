# Dynamiczna konfiguracja API URL

Aplikacja ładuje URL do API z pliku `config.json` w katalogu publicznym.

## 🔧 Jak to działa

1. Przy starcie aplikacji pobiera `/config.json`
2. Jeśli plik istnieje - używa `apiUrl` z pliku
3. Jeśli nie - używa domyślny URL: `http://localhost:9000/api`

## 🚀 Zmiana API URL po deployment

Po zbudowaniu aplikacji (`npm run build`) możesz:

```bash
# Zmienić API URL bez przebudowy
echo '{"apiUrl": "https://my-api.com/api"}' > dist/config.json
```

## 📝 Format config.json

```json
{
  "apiUrl": "https://api.example.com/api"
}
```

## 🎯 Przykłady

**Development:**
```json
{
  "apiUrl": "http://localhost:9000/api"
}
```

**Production:**
```json
{
  "apiUrl": "https://api.myapp.com/api"
}
```