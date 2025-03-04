import { gt, neq } from "semver";
import { mainnetId } from "../constants";

const migrations = {
  // Migrate local storage keys to have prefixed network id
  "0.6.0": () => {
    const ignoredKeys = ["ga_user_id", "isBetaBannerSeen", "latestUpdatedVersion"];
    const updatedStorage = {};

    Object.keys(localStorage).forEach((key) => {
      if (!ignoredKeys.includes(key)) {
        const newKey = `${mainnetId}/${key}`;
        updatedStorage[newKey] = localStorage.getItem(key);
        // Update the localStorage with  the new keys prefixed with network id
        localStorage.setItem(newKey, localStorage.getItem(key));
        localStorage.removeItem(key);
      } else {
        updatedStorage[key] = localStorage.getItem(key);
      }
    });

    localStorage.setItem("selectedNetworkId", mainnetId);

    // notify local storage hooks to update their values
    window.dispatchEvent(new Event("local-storage"));

    console.log(`Migration for version 0.6.0:`, updatedStorage);
  }
};

// Store latestUpdatedVersion in localStorage
// Check if latestUpdatedVersion is < currentVersion
// If so run all the version > until current is reached.
export const migrateLocalStorage = () => {
  const currentVersion = window.electron.getAppVersion();
  let latestUpdatedVersion = localStorage.getItem("latestUpdatedVersion");

  if (!latestUpdatedVersion) {
    // It's an upgrade from an old version
    if (Object.keys(localStorage).some((key) => key.endsWith(".data") || key.endsWith(".wallet"))) {
      latestUpdatedVersion = "0.5.0";
    } else {
      // It's a brand new installation
      latestUpdatedVersion = currentVersion;
      localStorage.setItem("selectedNetworkId", mainnetId);
    }
  }

  // Only apply migrations if there was a previous version
  if (latestUpdatedVersion && neq(currentVersion, latestUpdatedVersion)) {
    Object.keys(migrations).forEach((version) => {
      if (gt(version, latestUpdatedVersion)) {
        try {
          console.log(`Applying version ${version}`);
          // Execute local storage migration
          migrations[version]();
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  // Update the latestUpdatedVersion
  localStorage.setItem("latestUpdatedVersion", currentVersion);
};
