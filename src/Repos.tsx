import { Combobox, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import browser from 'webextension-polyfill'
interface Repo {
  name: string,
  url: string,
  id: string,
}

interface Response {
  id: string;
  name: string;
  url: string;
  html_url: string;
}
export default function Repos() {
  const [repo, setRepo] = useState<Array<Response>>([]);
  const [selected, setSelected] = useState("selectLanguage");
  const [query, setQuery] = useState("");
  useEffect(() => {
    setup();
  }, []);
  const setup = async () => {
    let accessToken = (await browser.storage.sync.get("accessToken"))[
      "accessToken"
    ];
    console.log(accessToken);
    fetchRepos(accessToken);
  }
  const filteredRepo =
    query === ""
      ? repo
      : repo.filter((rp) =>
          rp.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );
  const fetchRepos = async (accessToken: string) => {
    try {
      const response = await (await fetch("https://api.github.com/users/yidyedelina/repos", {
        method: "get",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${accessToken}`,
        },
      })).json() as unknown as Array<Response>;
      
      setRepo(response);
      console.log(response);
    } catch (err) {
      console.log("cathc you")
      console.log(err);
    }
  }
  const onChangeHandler = async (event:React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }
  const handleSelect = async (rp: string) => {
    setSelected(rp);
    setQuery("");
    let s = rp as unknown as Repo;
    await browser.storage.sync.set({repo: s.url});
  }
  return (
    <div className="z-50">
      {repo.length == 0 ? (
        "..."
      ) : (
        <Combobox value={selected} onChange={(repo)=>handleSelect(repo)}>
          <div className="relative mt-1">
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                displayValue={(rp:Repo) => rp.name}
                onChange={event => onChangeHandler(event)}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery("")}
            >
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredRepo.length === 0 && query !== "" ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    Nothing found.
                  </div>
                ) : (
                  filteredRepo.map((person) => (
                    <Combobox.Option
                      key={person.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-teal-600 text-white" : "text-gray-900"
                        }`
                      }
                      value={person}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {person.name}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-white" : "text-teal-600"
                              }`}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      )}
    </div>
  );
}
