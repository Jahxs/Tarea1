@echo off
set "MAVEN_EXE=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.12\59fe215c0ad6947fea90184bf7add084544567b927287592651fda3782e0e798\bin\mvn.cmd"
if exist "%MAVEN_EXE%" (
    call "%MAVEN_EXE%" %*
) else (
    call mvn %*
)
