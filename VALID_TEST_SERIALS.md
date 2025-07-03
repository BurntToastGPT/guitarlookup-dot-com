# Valid Gibson Serial Numbers for Testing

## Test Examples That Work With The New Pattern System

### 8-digit YDDDYRRR Pattern (1977-2005)

- **82368123** - Valid (Year digit 8 in positions 0 and 4, made in 1988)
- **91239456** - Valid (Year digit 9 in positions 0 and 4, made in 1979 or 1989)
- **00010123** - Valid (Year digit 0 in positions 0 and 4, made in 2000)

### 9-digit YDDDYBRRR Pattern (2005-2014)

- **512351234** - Valid (Year 2005, day 123, batch 1)
- **812381567** - Valid (Year 2008, day 123, batch 1)
- **112311789** - Valid (Year 2011, day 123, batch 1)

### 10-digit YYMMDDFFFF Pattern (2014-Present)

- **2401152345** - Valid (January 15, 2024)
- **2312251234** - Valid (December 25, 2023)

### 8-digit Decal Pattern (1975-1977)

- **99123456** - Valid (1975, starts with 99)
- **00123456** - Valid (1976, starts with 00)
- **06123456** - Valid (1977, starts with 06)

### 6-digit Pattern

- **123456** - Will ask clarifying questions about MADE IN USA stamp

### Custom Shop Pattern

- **CS91234** - Will ask about decade (1999, 2009, 2019, etc.)

### Les Paul Classic Pattern

- **9 1234** - Valid (1999 Les Paul Classic with space)
- **051234** - Valid (2005 Les Paul Classic without space)

## Why "82365123" Failed

The serial "82365123" was rejected because:

- Pattern YDDDYRRR requires positions 0 and 4 to match
- Position 0: 8
- Position 4: 5
- Since 8 ≠ 5, it doesn't match the pattern

## Testing Instructions

1. Go to http://localhost:3000
2. Select "Gibson" from the dropdown
3. Enter one of the valid serial numbers above
4. Answer any clarifying questions if prompted
5. Verify the decoded results display correctly in the chat window
