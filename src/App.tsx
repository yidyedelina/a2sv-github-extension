import { useEffect, useState } from "react";
import { GitHub, ExternalLink } from "react-feather";
import Input from "./Input";
import browser from "webextension-polyfill";
interface AuthData {
  code: string;
  uri: string;
}
interface UserData {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;

  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
}
function App() {
  const [authData, setAuthData]= useState<AuthData>();
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const onLogin = async () => {
    if (authorized) return;
    browser.runtime.sendMessage({
      type: "AUTH_REQUEST",
    });
  };

  // Initially check for authorised state
  useEffect(() => {
    (async () => {
      const key = "accessToken";
      const accessToken = (await browser.storage.sync.get(key))[key];
      if (accessToken) {
        setAuthorized(true);
      }
    })();
  }, []);
  useEffect(() => {
    (async () => {
      const key = "userData";
      const userData = (await browser.storage.sync.get(key))[key];
      if (userData) {
        setUser(userData);
      }
    })();
  }, [])

  // Checks whether an access token has just been set
  useEffect(() => {
    const onStorageChanged = (changes: any) => {
      if (changes.accessToken) {
        const accessToken = changes.accessToken.newValue;
        setAuthorized(Boolean(accessToken));
      }
    };

    browser.storage.sync.onChanged.addListener(onStorageChanged);

    return () => {
      browser.storage.sync.onChanged.removeListener(onStorageChanged);
    };
  }, []);

  useEffect(() => {
    const onMessage = async ({ type, payload }: { type: string; payload: any })=> {
      switch (type) {
        case "AUTH_RESPONSE":
          // Containing auth code and uri to display
          setAuthData(payload);
          break;
        case "UPLOAD_FILE_RESPONSE":
          if (payload.success) {
            console.log("Uploaded file successfully", payload);
            await navigator.clipboard.writeText(payload?.content.html_url);
          }
        // Replace button with link to gist
      }
      
    };

    browser.runtime.onMessage.addListener(onMessage);

    return () => {
      browser.runtime.onMessage.removeListener(onMessage);
    };
  }, []);

  return (
    <div className="App text-white bg-gray-800 p-5 min-w-[300px] min-h-[300px] flex flex-col justify-center items-center bg-dark">
      <h1 className="font-bold text-5xl text-center">A2SV</h1>
      {!authorized && !user && (
        <button
          type="button"
          className="rounded-lg py-3 px-5 mt-3 bg-gray-900 hover:text-gray-500 transition-colors cursor-pointer font-medium hover:border-blue-500 focus:ring"
          onClick={onLogin}
        >
          {authorized ? "" : "Authorise GitHub"}
          <GitHub className="h-6 inline ml-3" />
        </button>
      )}

      {authorized && user && (
        <>
          <div className="flex flex-col items-center">
            <img className="w-10 h-10 rounded" src={user?.avatar_url} />
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-400">{user?.login}</p>
          </div>
          <Input />
        </>
      )}
      {authData && (
        <div className="flex flex-row mt-2 items-center">
          <button
            type="button"
            title="Copy to clipboard"
            className="px-3 py-1 rounded-lg bg-gray-600 border-gray-200"
            onClick={() => navigator.clipboard.writeText(authData.code)}
          >
            <span className="w-6 h-4">Code: {authData?.code}</span>
          </button>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={authData?.uri}
            title="Open verification URL"
            className="ml-2 p-1 h-fit rounded-full bg-gray-700 border-blue-400"
          >
            <ExternalLink className="h-3 w-3 m-2" />
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
