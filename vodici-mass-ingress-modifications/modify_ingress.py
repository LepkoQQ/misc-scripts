import os
import re

REPO_BRANCHES = {
    "cefizelj": [
        "dz-2022",
        "za",
        "voda",
        "predsednik-2022",
        "predsednik-2022-drugi-krog",
        "rtv-referendum-2022",
        "evropske-2024",
        "referendum-dostojna-smrt-2025",
    ],
    "omnia": {
        "za-zemljevid",
        "voda",
        "predcasno-glasovanje-dz-2022",
        "omnia-dz-2022",
        "predcasno-glasovanje-predsednik-2022",
        "omnia-predsednik-2022",
        "predcasno-glasovanje-evropske-2024",
        "omnia-evropske-2024",
        "predcasno-glasovanje-referendum-dostojna-smrt-2025",
        "omnia-referendum-dostojna-smrt-2025",
    },
}


def modify_cefizelj_ingresses():
    print("Modifying ingress settings (cefizelj)...")
    root_dir = "/home/miha/Projects/djnd"
    for branch in REPO_BRANCHES["cefizelj"]:
        print(f"\n>>> {branch}")
        # cd to the repo directory
        os.chdir(f"{root_dir}/cefizelj")
        # checkout the branch
        os.system(f"git checkout {branch}")

        if os.system("git fetch --all") != 0:
            print(f"ERROR: fetch returned non-zero exit code.")
            break

        if os.system(f"git pull --ff-only") != 0:
            print(f"ERROR: pull returned non-zero exit code.")
            break

        if os.system("git status") != 0:
            print(f"ERROR: git status returned non-zero exit code.")
            break

        # load the ingress yaml file
        ingress_file = f"{root_dir}/cefizelj/kustomize/ingress.yaml"
        with open(ingress_file, "r") as f:
            ingress_str = f.read()

        if "&http_paths" in ingress_str:
            print(">>> already modified, skipping...")
            os.system("sleep 1")
            continue

        # replace secretName: * with secretName: volitveni-vodici-tls
        ingress_str = re.sub(
            r"secretName: .*",
            "secretName: volitveni-vodici-tls",
            ingress_str,
        )
        # replace hosts: * with the new hosts
        ingress_str = re.sub(
            r"hosts:(\n\s*-.*)*",
            "hosts:\n        - vodici.djnd.si\n        - vodici.danesjenovdan.si\n        - vodici.lb.djnd.si",
            ingress_str,
        )
        # comment out cert-manager annotations
        ingress_str = re.sub(
            r"^(\s*)cert-manager",
            r"\1#cert-manager",
            ingress_str,
            flags=re.MULTILINE,
        )
        # find "- host: vodici.djnd.si      http:"
        ingress_str = re.sub(
            r"- host: vodici.djnd.si\n\s*http:\s*$",
            "- host: vodici.djnd.si\n      http: &http_paths",
            ingress_str,
            flags=re.MULTILINE,
        )
        # find 2nd "- host:" and remove all lines until eof
        idx = ingress_str.find(
            "- host:", ingress_str.find("- host: vodici.djnd.si") + 1
        )
        if idx != -1:
            idx_line_start = ingress_str.rfind("\n", 0, idx) + 1
            ingress_str = ingress_str[:idx_line_start]
        # add hosts with http: *http_paths
        ingress_str += (
            "    - host: vodici.danesjenovdan.si\n"
            "      http: *http_paths\n"
            "    - host: vodici.lb.djnd.si\n"
            "      http: *http_paths\n"
        )

        # write back the modified ingress yaml file
        with open(ingress_file, "w") as f:
            f.write(ingress_str)

        # git add the modified ingress file
        os.system(f"git add {ingress_file}")
        # git commit with message "Modify ingress settings"
        os.system(
            'git commit -m "Modify ingress settings, fix tls secret, disable cert issuer"'
        )
        # git push
        os.system("git push")

        # sleep for 1 second
        os.system("sleep 1")


def modify_omnia_ingresses():
    print("Modifying ingress settings (omnia)...")
    root_dir = "/home/miha/Projects/djnd"
    for branch in REPO_BRANCHES["omnia"]:
        print(f"\n>>> {branch}")
        # cd to the repo directory
        os.chdir(f"{root_dir}/omnia")
        # checkout the branch
        os.system(f"git checkout {branch}")

        if os.system("git fetch --all") != 0:
            print(f"ERROR: fetch returned non-zero exit code.")
            break

        if os.system(f"git pull --ff-only") != 0:
            print(f"ERROR: pull returned non-zero exit code.")
            break

        if os.system("git status") != 0:
            print(f"ERROR: git status returned non-zero exit code.")
            break

        # load the ingress yaml file
        ingress_file = f"{root_dir}/omnia/kustomize/ingress.yaml"
        with open(ingress_file, "r") as f:
            ingress_str = f.read()

        if "&http_paths" in ingress_str:
            print(">>> already modified, skipping...")
            os.system("sleep 1")
            continue

        # replace secretName: * with secretName: volitveni-vodici-tls
        ingress_str = re.sub(
            r"secretName: .*",
            "secretName: volitveni-vodici-tls",
            ingress_str,
        )
        # replace hosts: * with the new hosts
        ingress_str = re.sub(
            r"hosts:(\n\s*-.*)*",
            "hosts:\n        - vodici.djnd.si\n        - vodici.danesjenovdan.si\n        - vodici.lb.djnd.si",
            ingress_str,
        )
        # comment out cert-manager annotations
        ingress_str = re.sub(
            r"^(\s*)cert-manager",
            r"\1#cert-manager",
            ingress_str,
            flags=re.MULTILINE,
        )
        # find "- host: vodici.djnd.si      http:"
        ingress_str = re.sub(
            r"- host: vodici.djnd.si\n\s*http:\s*$",
            "- host: vodici.djnd.si\n      http: &http_paths",
            ingress_str,
            flags=re.MULTILINE,
        )
        # find 2nd "- host:" and remove all lines until eof
        idx = ingress_str.find(
            "- host:", ingress_str.find("- host: vodici.djnd.si") + 1
        )
        if idx != -1:
            idx_line_start = ingress_str.rfind("\n", 0, idx) + 1
            ingress_str = ingress_str[:idx_line_start]
        # add hosts with http: *http_paths
        ingress_str += (
            "    - host: vodici.danesjenovdan.si\n"
            "      http: *http_paths\n"
            "    - host: vodici.lb.djnd.si\n"
            "      http: *http_paths\n"
        )

        # write back the modified ingress yaml file
        with open(ingress_file, "w") as f:
            f.write(ingress_str)

        # git add the modified ingress file
        os.system(f"git add {ingress_file}")
        # git commit with message "Modify ingress settings"
        os.system(
            'git commit -m "Modify ingress settings, fix tls secret, disable cert issuer"'
        )
        # git push
        os.system("git push")

        # sleep for 1 second
        os.system("sleep 1")


def main():
    # modify_cefizelj_ingresses()
    modify_omnia_ingresses()


if __name__ == "__main__":
    main()
