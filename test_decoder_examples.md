# Gibson Serial Decoder Test Examples

## How the New Pattern System Works

### Example 1: 8-digit impressed serial "82365123"

1. Serial: "82365123"
2. Pattern detected: "YDDDYRRR" (matches the pattern)
3. Decoded:
   - Year digit: 8 (1978 or 1988)
   - Day of year: 236
   - Factory ranking: 123
   - Result: Made on day 236 (August 24) of 1988

### Example 2: Custom Shop serial "CS91234"

1. Serial: "CS91234"
2. Pattern detected: "CSYRRRR"
3. Would ask clarifying question: "What decade was your guitar made?"
4. After answer (e.g., "2010s"):
   - Result: 2019 Custom Shop, sequence #1234

### Example 3: 6-digit serial "123456"

1. Serial: "123456"
2. Pattern detected: "XXXXXX"
3. Would check for clarifying questions about:
   - "MADE IN USA" stamp presence
   - Volute presence
4. Based on answers, determines if it's 1960s or 1970s

### Example 4: Modern 10-digit serial "2401152345"

1. Serial: "2401152345"
2. Pattern detected: "YYMMDDFFFF"
3. Decoded:
   - Year: 2024
   - Month: 01 (January)
   - Day: 15
   - Factory order: 2345
   - Result: Made on January 15, 2024

## Key Features of the New System

1. **Pattern Recognition**: Automatically converts serials to placeholder patterns
2. **Clarifying Questions**: Dynamically asks questions based on JSON rules
3. **Ambiguity Notes**: Displays special notes when patterns have known ambiguities
4. **Multiple Questions**: Can ask follow-up questions to narrow down results
5. **Source Tracking**: Shows sources from the JSON data

## Testing the System

To test a serial number:

1. Enter a Gibson serial number on the home page
2. Answer any clarifying questions that appear
3. View the detailed results including:
   - Decoded values
   - Production dates
   - Factory information
   - Confidence level
   - Any ambiguity notes
