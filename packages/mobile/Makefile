code coverage -w:
	flutter test --coverage 
	perl "$(GENHTML)" -o coverage\html coverage\lcov.info
	@"$(ComSpec)" /c start /b "coverage\html\index.html"
#	@"C:\Windows\System32\cmd.exe" /c start /b "coverage\html\index.html"

mocks:
	flutter pub run build_runner build

