import JSZip from 'jszip';
import { ANDROID_FILES } from '../data/androidProjectFiles';

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Add all primary files from registry
  for (const file of ANDROID_FILES) {
    zip.file(file.path, file.content);
  }

  // Add gradle-wrapper.properties
  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`
  );

  // Add gradle.properties
  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true`
  );

  // Add gradlew shell script
  zip.file(
    'gradlew',
    `#!/bin/sh
PRG="$0"
while [ -h "$PRG" ] ; do
    ls=\`ls -ld "$PRG"\`
    link=\`expr "$ls" : '.*-> \\(.*\\)$'\`
    if expr "$link" : '/.*' > /dev/null; then
        PRG="$link"
    else
        PRG=\`dirname "$PRG"\`"/$link"
    fi
done
SAVED="\`pwd\`"
cd "\`dirname \\"$PRG\\"\`/" >/dev/null
APP_HOME="\`pwd -P\`"
cd "$SAVED" >/dev/null
exec java -Xmx64m -Dorg.gradle.appname=gradlew -classpath "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain "$@"
`,
    { unixPermissions: '755' }
  );

  // Add gradlew.bat
  zip.file(
    'gradlew.bat',
    `@rem Windows Gradle wrapper
@if "%DEBUG%" == "" @echo off
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%
java -Xmx64m -classpath "%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
`
  );

  // Add Android resources: strings.xml, colors.xml, themes.xml, icons
  zip.file(
    'app/src/main/res/values/strings.xml',
    `<resources>
    <string name="app_name">MultiBrowser Pro</string>
    <string name="browser_panel_1">Browser 1</string>
    <string name="browser_panel_2">Browser 2</string>
    <string name="browser_panel_3">Browser 3</string>
    <string name="url_hint">Enter website URL</string>
</resources>`
  );

  zip.file(
    'app/src/main/res/values/colors.xml',
    `<resources>
    <color name="black">#FF0A0D12</color>
    <color name="primary_accent">#FF3B82F6</color>
</resources>`
  );

  zip.file(
    'app/src/main/res/values/themes.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.MultiBrowserPro" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">#0A0D12</item>
        <item name="android:navigationBarColor">#0A0D12</item>
    </style>
</resources>`
  );

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
